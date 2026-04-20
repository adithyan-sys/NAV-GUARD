from flask import Flask, request, jsonify
from flask_cors import CORS
import openbharatocr
import os
import tempfile
import re


app = Flask(__name__)
CORS(app)  # Allows React to communicate with this backend


def _normalize_value(value):
    if value is None:
        return ''
    return str(value).strip()


def _get_field(result_dict, candidates):
    """Fetch first non-empty field value from OCR dict using case-insensitive key matching."""
    if not isinstance(result_dict, dict):
        return ''

    normalized_map = {
        str(k).strip().lower(): _normalize_value(v)
        for k, v in result_dict.items()
    }
    for key in candidates:
        value = normalized_map.get(key.lower(), '')
        if value:
            return value
    return ''


def _merge_missing_fields(target, source):
    for key in target.keys():
        if not target.get(key) and source.get(key):
            target[key] = source[key]


def extract_structured_data(text, doc_type='other'):
    """
    Extract specific fields from OCR text of Indian Passport
    Returns: Dict with name and id_number.
    """
    extracted = {
        'name': '',
        'given_name': '',
        'surname': '',
        'id_number': ''
    }

    # 1. Passport Number 

    passport_match = re.search(r'(?:Passport No\.?|P<IND|Passport Number)\s*[:=]?\s*([A-Z][0-9]{7})', text, re.IGNORECASE)
    if passport_match:
        extracted['id_number'] = passport_match.group(1).strip()

    # 2. Name extraction - Indian passport style

    lines = [line.strip() for line in text.split('\n') if line.strip()]

    surname_patterns = [
        r'^Surname\s*[:=]\s*(.+)$',
        r'Surname\s*[:=]\s*(.+)$',
        r'^(?:SURNAME|Surname)\s*[:=]?\s*([A-Z\s/]+?)(?:\s*$|\n|Given)',
        r'Surname:\s*([A-Z\s]+)',
    ]

    given_name_patterns = [
        r'^Given Name\s*[:=]\s*(.+)$',
        r'Given Name\s*[:=]\s*(.+)$',
        r'^(?:Given Name|GIVEN NAME)\s*[:=]?\s*(.+?)(?:\s*$|\n|Nationality|Sex)',
        r'Given\s+Name\s*[:=]\s*(.+)',
    ]

    # Try to find surname
    for pattern in surname_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            extracted['surname'] = match.group(1).strip()
            break

    # Try to find given name
    for pattern in given_name_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            extracted['given_name'] = match.group(1).strip()
            break

    # Fallback: look for two consecutive name-like lines after "Type P" or "IND"
    if not extracted['surname'] and not extracted['given_name']:
        for i, line in enumerate(lines):
            if 'passport' in line.lower() or 'type p' in line.lower() or 'repub' in line.lower():
                # next few lines are usually surname & given name
                for j in range(i+1, min(i+8, len(lines))):
                    if re.match(r'^[A-Z\s/]{3,}$', lines[j]):
                        if not extracted['surname']:
                            extracted['surname'] = lines[j].strip()
                        elif not extracted['given_name']:
                            extracted['given_name'] = lines[j].strip()
                            break

    # Build full name (most common format: Given name + Surname)
    if extracted['given_name'] and extracted['surname']:
        extracted['name'] = f"{extracted['given_name']} {extracted['surname']}".strip()
    elif extracted['given_name']:
        extracted['name'] = extracted['given_name']
    elif extracted['surname']:
        extracted['name'] = extracted['surname']
    
    # Extract ID NUMBER - Aadhaar, PAN, DL, etc.
    id_patterns = [
        r'(?:Aadhaar|AADHAAR)\s*[:=]?\s*(\d{4}\s?\d{4}\s?\d{4})',  # Aadhaar
        r'(?:PAN|Pan)\s*[:=]?\s*([A-Z]{5}[0-9]{4}[A-Z]{1})',  # PAN
        r'(?:ID|Licence|License)\s*[:=]?\s*([A-Z0-9]{6,20})',  # Driving License
        r'(?:Passport)\s*[:=]?\s*([A-Z0-9]{6,9})',  # Passport
    ]
    for pattern in id_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted['id_number'] = match.group(1)
            break
    
    # If no structured ID found, try to find likely alphanumeric IDs with digits.
    if not extracted['id_number']:
        id_match = re.search(r'\b(?=[A-Z0-9]{8,20}\b)(?=.*\d)[A-Z0-9]+\b', text)
        if id_match:
            extracted['id_number'] = id_match.group(0)
    
    return extracted


def extract_pan_data(text):
    """
    Extract specific fields from OCR text of Indian PAN Card
    Returns: Dict with name and pan_number.
    """
    extracted = {
        'name': '',
        'pan_number': ''
    }

    # 1. PAN Number - Format: AAAAA9999A (5 letters, 4 digits, 1 letter)
    pan_match = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b', text)
    if pan_match:
        extracted['pan_number'] = pan_match.group(1).strip()

    # 2. Name extraction - Usually after "Name" or similar
    name_patterns = [
        r'(?:Name|NAME)\s*[:=]?\s*(.+?)(?:\n|$)',
        r'Name\s*[:=]?\s*([A-Z\s]+?)(?:\n|Father|Fathers|DOB|Date)',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            extracted['name'] = match.group(1).strip()
            break

    return extracted


@app.route('/ocr', methods=['POST'])
@app.route('/api/ocr', methods=['POST'])
def process_document():
    """
    Receives document image from React
    Returns structured data (NAME, ID)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        doc_type = _normalize_value(request.form.get('doc_type', 'other')).lower() or 'other'  # optional document type
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save temporarily
        temp_fd, temp_path = tempfile.mkstemp(prefix='navguard_', suffix='.jpeg')
        os.close(temp_fd)
        file.save(temp_path)
    
        try:
            # Process with openbharatocr - try passport first, fallback to generic
            extracted_text = ''
            structured_data = {
                'name': '',
                                'id_number': ''
            }
            
            try:
                if doc_type.lower() == 'pan':
                    # For PAN cards, use generic OCR and custom extraction
                    result = openbharatocr.generic(temp_path)
                    if isinstance(result, dict):
                        extracted_text = result.get('text', '') or str(result)
                    else:
                        extracted_text = str(result)
                    
                    # Extract PAN-specific data
                    pan_data = extract_pan_data(extracted_text)
                    structured_data['name'] = pan_data['name']
                    structured_data['id_number'] = pan_data['pan_number']
                else:
                    # For passport or other docs
                    result = openbharatocr.passport(temp_path)
                    print(f"Passport result: {result}, type: {type(result)}")
                    
                    if isinstance(result, dict):
                        # Map OpenBharatOCR passport fields with flexible key matching.
                        given_name = _get_field(result, ['Given Name', 'Given Names', 'given_name'])
                        surname = _get_field(result, ['Surname', 'Last Name', 'Family Name'])
                        full_name = _get_field(result, ['Name', 'Full Name', 'name'])

                        structured_data['name'] = full_name or f"{given_name} {surname}".strip()
                        structured_data['id_number'] = _get_field(
                            result,
                            ['Passport Number', 'Passport No', 'Passport No.', 'Document Number']
                        )
                        extracted_text = str(result)

                        # Fallback parse if key OCR fields are missing or poorly mapped.
                        if not structured_data['name'] or not structured_data['id_number']:
                            generic_result = openbharatocr.generic(temp_path)
                            if isinstance(generic_result, dict):
                                generic_text = generic_result.get('text', '') or str(generic_result)
                            else:
                                generic_text = str(generic_result)

                            parsed = extract_structured_data(generic_text, doc_type)
                            _merge_missing_fields(structured_data, parsed)

                            if generic_text:
                                extracted_text = f"{extracted_text}\n\n{generic_text}".strip()
                    else:
                        extracted_text = str(result)
                        parsed = extract_structured_data(extracted_text, doc_type)
                        _merge_missing_fields(structured_data, parsed)
                        
            except Exception as e:
                print(f"Document type {doc_type} failed: {e}, trying generic...")
                try:
                    result = openbharatocr.generic(temp_path)
                    print(f"Generic result: {result}, type: {type(result)}")
                    
                    if isinstance(result, dict):
                        extracted_text = result.get('text', '') or str(result)
                    else:
                        extracted_text = str(result)
                    
                    # Try to extract from generic text based on doc_type
                    if doc_type.lower() == 'pan':
                        pan_data = extract_pan_data(extracted_text)
                        structured_data['name'] = pan_data['name']
                        structured_data['id_number'] = pan_data['pan_number']
                    else:
                        structured_data = extract_structured_data(extracted_text, doc_type)
                except Exception as e2:
                    print(f"Generic also failed: {e2}")
                    return jsonify({'error': f'OCR processing failed: {str(e2)}'}), 500

            # Normalize whitespace-only values and clean ID format.
            structured_data['name'] = _normalize_value(structured_data['name'])
            structured_data['id_number'] = _normalize_value(structured_data['id_number']).replace(' ', '')
            
            if not extracted_text and not structured_data['name']:
                return jsonify({'error': 'No text extracted from image'}), 400
            
            print(f"Extracted text: {extracted_text[:100]}...")
            print(f"Structured data: {structured_data}")
            
            response = {
                'name': structured_data['name'],
                'id_number': structured_data['id_number']
            }
            
            print(f"Response: {response}")
            return jsonify(response), 200
        
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'Backend is running'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=8000)