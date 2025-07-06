#!/usr/bin/env python3
import requests
import base64
import json
import os
import uuid
import time
from pathlib import Path
import sys

# Get the backend URL from the frontend .env file
def get_backend_url():
    env_file_path = Path("/app/frontend/.env")
    if not env_file_path.exists():
        print("Frontend .env file not found")
        sys.exit(1)
    
    with open(env_file_path, "r") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.strip().split("=", 1)[1].strip('"\'')
    
    print("REACT_APP_BACKEND_URL not found in .env file")
    sys.exit(1)

# Base URL for API requests
BASE_URL = f"{get_backend_url()}/api"
print(f"Using backend URL: {BASE_URL}")

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def run_test(test_func):
    """Decorator to run tests and track results"""
    def wrapper():
        test_results["total"] += 1
        test_name = test_func.__name__
        print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
        
        try:
            result = test_func()
            if result:
                test_results["passed"] += 1
                test_results["tests"].append({"name": test_name, "status": "PASSED"})
                print(f"✅ Test {test_name} PASSED")
                return True
            else:
                test_results["failed"] += 1
                test_results["tests"].append({"name": test_name, "status": "FAILED"})
                print(f"❌ Test {test_name} FAILED")
                return False
        except Exception as e:
            test_results["failed"] += 1
            test_results["tests"].append({"name": test_name, "status": "ERROR", "error": str(e)})
            print(f"❌ Test {test_name} ERROR: {str(e)}")
            return False
    
    return wrapper

# Create a sample text file for testing
def create_sample_text_file():
    file_path = Path("/tmp/sample_document.txt")
    with open(file_path, "w") as f:
        f.write("""
        # SaDA AI Project Overview
        
        This document provides an overview of the SaDA AI project, which focuses on document analysis and customer support automation.
        
        ## Key Features
        
        1. Document Analysis
        2. Multimodal Chat Support
        3. AI-powered Insights
        
        ## Technical Stack
        
        - Frontend: React with Tailwind CSS
        - Backend: FastAPI
        - Database: MongoDB
        - AI: Gemini API
        
        ## Implementation Timeline
        
        The project is expected to be completed in 3 phases over the next 6 months.
        """)
    return file_path

# Convert file to base64
def file_to_base64(file_path):
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# Test functions
@run_test
def test_api_health():
    """Test the API health endpoint"""
    response = requests.get(f"{BASE_URL}/")
    if response.status_code != 200:
        print(f"Health check failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if "message" not in data:
        print("Health check response missing 'message' field")
        return False
    
    print(f"Health check response: {data}")
    return True

@run_test
def test_create_chat_session():
    """Test creating a chat session"""
    session_data = {
        "session_name": f"Test Session {uuid.uuid4()}",
        "session_type": "document_analysis"
    }
    
    response = requests.post(f"{BASE_URL}/chat/sessions", json=session_data)
    if response.status_code != 200:
        print(f"Create session failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    required_fields = ["id", "session_name", "session_type", "created_at", "updated_at"]
    for field in required_fields:
        if field not in data:
            print(f"Create session response missing '{field}' field")
            return False
    
    print(f"Created session with ID: {data['id']}")
    # Store session ID for other tests
    global test_session_id
    test_session_id = data["id"]
    return True

@run_test
def test_get_chat_sessions():
    """Test retrieving chat sessions"""
    response = requests.get(f"{BASE_URL}/chat/sessions")
    if response.status_code != 200:
        print(f"Get sessions failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if not isinstance(data, list):
        print(f"Get sessions response is not a list: {data}")
        return False
    
    print(f"Retrieved {len(data)} chat sessions")
    return True

@run_test
def test_get_chat_session_by_id():
    """Test retrieving a specific chat session"""
    global test_session_id
    if not test_session_id:
        print("No test session ID available")
        return False
    
    response = requests.get(f"{BASE_URL}/chat/sessions/{test_session_id}")
    if response.status_code != 200:
        print(f"Get session by ID failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if data["id"] != test_session_id:
        print(f"Retrieved session ID {data['id']} does not match expected {test_session_id}")
        return False
    
    print(f"Successfully retrieved session: {data['session_name']}")
    return True

@run_test
def test_file_upload():
    """Test file upload endpoint"""
    # Create a sample file
    file_path = create_sample_text_file()
    
    # Upload the file
    with open(file_path, "rb") as f:
        files = {"file": (file_path.name, f, "text/plain")}
        response = requests.post(f"{BASE_URL}/upload", files=files)
    
    if response.status_code != 200:
        print(f"File upload failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    required_fields = ["filename", "content_type", "size", "file_content"]
    for field in required_fields:
        if field not in data:
            print(f"File upload response missing '{field}' field")
            return False
    
    # Store file data for document analysis test
    global test_file_data
    test_file_data = data
    
    print(f"Successfully uploaded file: {data['filename']}, size: {data['size']} bytes")
    return True

@run_test
def test_document_analysis():
    """Test document analysis endpoint"""
    global test_session_id, test_file_data
    if not test_session_id or not test_file_data:
        print("Missing test session ID or file data")
        return False
    
    analysis_data = {
        "filename": test_file_data["filename"],
        "content_type": test_file_data["content_type"],
        "file_size": test_file_data["size"],
        "analysis_type": "summary",
        "file_content": test_file_data["file_content"],
        "session_id": test_session_id
    }
    
    print("Sending document for analysis...")
    response = requests.post(f"{BASE_URL}/documents/analyze", json=analysis_data)
    if response.status_code != 200:
        print(f"Document analysis failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    required_fields = ["id", "filename", "summary", "key_insights", "session_id"]
    for field in required_fields:
        if field not in data:
            print(f"Document analysis response missing '{field}' field")
            return False
    
    print(f"Document analysis successful. Summary: {data['summary'][:100]}...")
    return True

@run_test
def test_get_document_analyses():
    """Test retrieving document analyses"""
    response = requests.get(f"{BASE_URL}/documents/analyses")
    if response.status_code != 200:
        print(f"Get analyses failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if not isinstance(data, list):
        print(f"Get analyses response is not a list: {data}")
        return False
    
    print(f"Retrieved {len(data)} document analyses")
    return True

@run_test
def test_get_session_analyses():
    """Test retrieving analyses for a specific session"""
    global test_session_id
    if not test_session_id:
        print("No test session ID available")
        return False
    
    response = requests.get(f"{BASE_URL}/documents/analyses/{test_session_id}")
    if response.status_code != 200:
        print(f"Get session analyses failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if not isinstance(data, list):
        print(f"Get session analyses response is not a list: {data}")
        return False
    
    print(f"Retrieved {len(data)} analyses for session {test_session_id}")
    return True

@run_test
def test_chat_message():
    """Test sending a chat message"""
    global test_session_id
    if not test_session_id:
        print("No test session ID available")
        return False
    
    message_data = {
        "session_id": test_session_id,
        "user_message": "What are the key features of the SaDA AI project?",
        "message_type": "text"
    }
    
    print("Sending chat message...")
    response = requests.post(f"{BASE_URL}/chat/message", json=message_data)
    if response.status_code != 200:
        print(f"Chat message failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    required_fields = ["id", "session_id", "user_message", "ai_response"]
    for field in required_fields:
        if field not in data:
            print(f"Chat message response missing '{field}' field")
            return False
    
    print(f"Chat message successful. Response: {data['ai_response'][:100]}...")
    return True

@run_test
def test_get_chat_messages():
    """Test retrieving chat messages for a session"""
    global test_session_id
    if not test_session_id:
        print("No test session ID available")
        return False
    
    response = requests.get(f"{BASE_URL}/chat/messages/{test_session_id}")
    if response.status_code != 200:
        print(f"Get chat messages failed with status code {response.status_code}")
        return False
    
    data = response.json()
    if not isinstance(data, list):
        print(f"Get chat messages response is not a list: {data}")
        return False
    
    print(f"Retrieved {len(data)} chat messages for session {test_session_id}")
    return True

@run_test
def test_multimodal_chat():
    """Test sending a chat message with file attachment"""
    global test_session_id, test_file_data
    if not test_session_id or not test_file_data:
        print("Missing test session ID or file data")
        return False
    
    message_data = {
        "session_id": test_session_id,
        "user_message": "Can you analyze this document and tell me about its structure?",
        "message_type": "file",
        "file_content": test_file_data["file_content"],
        "file_type": test_file_data["content_type"]
    }
    
    print("Sending multimodal chat message...")
    response = requests.post(f"{BASE_URL}/chat/message", json=message_data)
    if response.status_code != 200:
        print(f"Multimodal chat failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    required_fields = ["id", "session_id", "user_message", "ai_response", "file_content", "file_type"]
    for field in required_fields:
        if field not in data:
            print(f"Multimodal chat response missing '{field}' field")
            return False
    
    print(f"Multimodal chat successful. Response: {data['ai_response'][:100]}...")
    return True

def print_summary():
    """Print test results summary"""
    print(f"\n{'='*80}")
    print(f"TEST SUMMARY")
    print(f"{'='*80}")
    print(f"Total tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    print(f"Success rate: {(test_results['passed'] / test_results['total']) * 100:.2f}%")
    print(f"{'='*80}")
    
    # Print individual test results
    for test in test_results["tests"]:
        status_symbol = "✅" if test["status"] == "PASSED" else "❌"
        print(f"{status_symbol} {test['name']}: {test['status']}")
        if "error" in test:
            print(f"   Error: {test['error']}")
    
    print(f"{'='*80}")

if __name__ == "__main__":
    # Global variables for test data
    test_session_id = None
    test_file_data = None
    
    # Run tests
    test_api_health()
    test_create_chat_session()
    test_get_chat_sessions()
    test_get_chat_session_by_id()
    test_file_upload()
    test_document_analysis()
    test_get_document_analyses()
    test_get_session_analyses()
    test_chat_message()
    test_get_chat_messages()
    test_multimodal_chat()
    
    # Print summary
    print_summary()