#!/usr/bin/env python3

import requests
import sys
import json
import io
from datetime import datetime

class LensifyrAPITester:
    def __init__(self, base_url="https://lens-command-center.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.organizer_id = None
        self.event_id = None
        self.event_code = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        # Remove Content-Type for file uploads
        if files:
            headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_register(self):
        """Test organizer registration"""
        test_data = {
            "name": "Test User",
            "email": "test@studio.com",
            "password": "Test123!",
            "studioName": "Test Studio",
            "studioAddress": "123 Main St",
            "phoneNumber": "+1234567890"
        }
        
        success, response = self.run_test(
            "Register Organizer",
            "POST",
            "organizer/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.organizer_id = response['organizer']['_id']
            print(f"   Token received: {self.token[:20]}...")
            print(f"   Organizer ID: {self.organizer_id}")
            return True
        return False

    def test_login(self):
        """Test organizer login"""
        login_data = {
            "email": "test@studio.com",
            "password": "Test123!"
        }
        
        success, response = self.run_test(
            "Login Organizer",
            "POST",
            "organizer/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.organizer_id = response['organizer']['_id']
            return True
        return False

    def test_get_profile(self):
        """Test get organizer profile"""
        success, response = self.run_test(
            "Get Profile",
            "GET",
            "organizer/profile",
            200
        )
        return success

    def test_update_profile(self):
        """Test update organizer profile"""
        update_data = {
            "name": "Updated Test User",
            "studioName": "Updated Test Studio"
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PATCH",
            "organizer/update-profile",
            200,
            data=update_data
        )
        return success

    def test_create_event(self):
        """Test create event"""
        event_data = {
            "title": "Test Wedding Event",
            "eventDate": datetime.now().isoformat()
        }
        
        success, response = self.run_test(
            "Create Event",
            "POST",
            "event/create",
            200,
            data=event_data
        )
        
        if success and '_id' in response:
            self.event_id = response['_id']
            self.event_code = response['eventCode']
            print(f"   Event ID: {self.event_id}")
            print(f"   Event Code: {self.event_code}")
            return True
        return False

    def test_get_my_events(self):
        """Test get my events"""
        success, response = self.run_test(
            "Get My Events",
            "GET",
            "event/my-events",
            200
        )
        return success

    def test_get_event(self):
        """Test get specific event"""
        if not self.event_id:
            print("❌ No event ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Event",
            "GET",
            f"event/{self.event_id}",
            200
        )
        return success

    def test_verify_event(self):
        """Test verify event code"""
        if not self.event_code:
            print("❌ No event code available for testing")
            return False
            
        verify_data = {
            "eventCode": self.event_code
        }
        
        success, response = self.run_test(
            "Verify Event Code",
            "POST",
            "event/verify",
            200,
            data=verify_data
        )
        return success

    def test_upload_image(self):
        """Test image upload (mocked)"""
        if not self.event_id:
            print("❌ No event ID available for testing")
            return False
        
        # Create a dummy image file
        dummy_image = io.BytesIO(b"fake image data")
        dummy_image.name = "test_image.jpg"
        
        files = {'image': ('test_image.jpg', dummy_image, 'image/jpeg')}
        data = {'eventId': self.event_id}
        
        success, response = self.run_test(
            "Upload Image",
            "POST",
            "image/upload",
            200,
            data=data,
            files=files
        )
        return success

    def test_get_stats(self):
        """Test get stats"""
        success, response = self.run_test(
            "Get Stats",
            "GET",
            "stats",
            200
        )
        return success

    def test_search_organizers(self):
        """Test search organizers"""
        success, response = self.run_test(
            "Search Organizers",
            "GET",
            "organizer/search?q=Test",
            200
        )
        return success

    def test_delete_event(self):
        """Test delete event"""
        if not self.event_id:
            print("❌ No event ID available for testing")
            return False
            
        success, response = self.run_test(
            "Delete Event",
            "DELETE",
            f"event/delete/{self.event_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Lensifyr API Tests")
    print("=" * 50)
    
    tester = LensifyrAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Register", tester.test_register),
        ("Get Profile", tester.test_get_profile),
        ("Update Profile", tester.test_update_profile),
        ("Create Event", tester.test_create_event),
        ("Get My Events", tester.test_get_my_events),
        ("Get Event", tester.test_get_event),
        ("Verify Event", tester.test_verify_event),
        ("Upload Image", tester.test_upload_image),
        ("Get Stats", tester.test_get_stats),
        ("Search Organizers", tester.test_search_organizers),
        ("Delete Event", tester.test_delete_event),
    ]
    
    # Run tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())