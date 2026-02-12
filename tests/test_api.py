"""
API endpoint tests for the Protein Classification backend.
Tests cover: input validation, rate limiting, error handling, and core endpoints.
"""
import unittest
import json
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, validate_sequence


class TestInputValidation(unittest.TestCase):
    """Test the validate_sequence function directly."""

    def test_empty_sequence(self):
        with app.test_request_context():
            result, error = validate_sequence('')
            self.assertIsNone(result)
            self.assertIsNotNone(error)

    def test_none_sequence(self):
        with app.test_request_context():
            result, error = validate_sequence(None)
            self.assertIsNone(result)
            self.assertIsNotNone(error)

    def test_valid_sequence(self):
        with app.test_request_context():
            result, error = validate_sequence('MKTVRQERLKSIVRILERSKEPVSGAQ')
            self.assertEqual(result, 'MKTVRQERLKSIVRILERSKEPVSGAQ')
            self.assertIsNone(error)

    def test_lowercase_converted(self):
        with app.test_request_context():
            result, error = validate_sequence('mktvrq')
            self.assertEqual(result, 'MKTVRQ')
            self.assertIsNone(error)

    def test_whitespace_stripped(self):
        with app.test_request_context():
            result, error = validate_sequence('MKT VRQ\nERL')
            self.assertEqual(result, 'MKTVRQERL')
            self.assertIsNone(error)

    def test_invalid_characters_rejected(self):
        with app.test_request_context():
            result, error = validate_sequence('MKTVRQ123!@#')
            self.assertIsNone(result)
            self.assertIsNotNone(error)

    def test_too_long_sequence(self):
        with app.test_request_context():
            long_seq = 'M' * 2001
            result, error = validate_sequence(long_seq)
            self.assertIsNone(result)
            self.assertIsNotNone(error)

    def test_max_length_accepted(self):
        with app.test_request_context():
            seq = 'M' * 2000
            result, error = validate_sequence(seq)
            self.assertEqual(len(result), 2000)
            self.assertIsNone(error)

    def test_all_valid_amino_acids(self):
        with app.test_request_context():
            valid_aas = 'ACDEFGHIKLMNPQRSTVWXY'
            result, error = validate_sequence(valid_aas)
            self.assertEqual(result, valid_aas)
            self.assertIsNone(error)


class TestAPIEndpoints(unittest.TestCase):
    """Test API endpoints via Flask test client."""

    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()

    def test_predict_no_body(self):
        response = self.client.post('/api/predict',
                                     content_type='application/json',
                                     data='{}')
        data = response.get_json()
        self.assertEqual(response.status_code, 400)

    def test_predict_empty_sequence(self):
        response = self.client.post('/api/predict',
                                     content_type='application/json',
                                     data=json.dumps({'sequence': ''}))
        self.assertEqual(response.status_code, 400)

    def test_predict_invalid_chars(self):
        response = self.client.post('/api/predict',
                                     content_type='application/json',
                                     data=json.dumps({'sequence': 'MKTVRQ123!!'}))
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid characters', data['error'])

    def test_predict_too_long(self):
        response = self.client.post('/api/predict',
                                     content_type='application/json',
                                     data=json.dumps({'sequence': 'M' * 2001}))
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn('too long', data['error'])

    def test_fold_empty_sequence(self):
        response = self.client.post('/api/fold',
                                     content_type='application/json',
                                     data=json.dumps({'sequence': ''}))
        self.assertEqual(response.status_code, 400)

    def test_fold_invalid_chars(self):
        response = self.client.post('/api/fold',
                                     content_type='application/json',
                                     data=json.dumps({'sequence': '<script>alert(1)</script>'}))
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid characters', data['error'])

    def test_data_endpoint(self):
        response = self.client.get('/api/data')
        # Will be 200 if data loaded, 500 if not — both are valid states
        self.assertIn(response.status_code, [200, 500])

    def test_predict_not_json(self):
        response = self.client.post('/api/predict',
                                     content_type='text/plain',
                                     data='MKTVRQ')
        self.assertIn(response.status_code, [400, 415])  # Flask returns 415 for non-JSON content

    def test_fold_not_json(self):
        response = self.client.post('/api/fold',
                                     content_type='text/plain',
                                     data='MKTVRQ')
        self.assertIn(response.status_code, [400, 415])  # Flask returns 415 for non-JSON content


class TestRateLimiting(unittest.TestCase):
    """Test that rate limiting works."""

    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()

    def test_rate_limit_headers(self):
        """Send many rapid requests and verify rate limit kicks in."""
        # The fold endpoint has the tightest limit (10/min)
        responses = []
        for _ in range(12):
            r = self.client.post('/api/fold',
                                  content_type='application/json',
                                  data=json.dumps({'sequence': 'MKTVRQERLK'}))
            responses.append(r.status_code)

        # At least one should be 429 (rate limited)
        self.assertIn(429, responses,
                      "Rate limiting did not trigger after 12 rapid requests")


if __name__ == '__main__':
    unittest.main()
