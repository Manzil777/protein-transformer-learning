import unittest
import os
import shutil
from src.data_loader import load_fasta, clean_sequence, encode_labels

class TestDataLoader(unittest.TestCase):
    def setUp(self):
        self.test_dir = "tests/temp_data"
        os.makedirs(self.test_dir, exist_ok=True)
        self.fasta_path = os.path.join(self.test_dir, "test.fasta")
        with open(self.fasta_path, "w") as f:
            f.write(">seq1\nMKTVRQERLKSIVRILERSKEPVSGAQLAEELSVSRQVIVQDIAYLRSLGYNIVATPRGYVLAGG\n")
            f.write(">seq2\nKALTARQQEVFDLIRDHISQTGMPPTRAEIAQRLGFRSPNAAEEHLKALARKGVIEIVSGASRGIRLLQEE\n")

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_load_fasta(self):
        sequences = load_fasta(self.fasta_path)
        self.assertEqual(len(sequences), 2)
        self.assertEqual(sequences[0][0], "seq1")
        self.assertTrue(sequences[0][1].startswith("MKTVRQ"))

    def test_clean_sequence(self):
        raw_seq = "MKTVRQBZOJ"
        cleaned = clean_sequence(raw_seq)
        self.assertEqual(cleaned, "MKTVRQXXXX")
        
    def test_encode_labels(self):
        labels = ["FamilyA", "FamilyB", "FamilyA", "FamilyC"]
        encoded, mapping = encode_labels(labels)
        self.assertEqual(len(encoded), 4)
        self.assertEqual(mapping["FamilyA"], 0)
        self.assertEqual(mapping["FamilyB"], 1)
        self.assertEqual(mapping["FamilyC"], 2)
        self.assertEqual(encoded, [0, 1, 0, 2])

if __name__ == '__main__':
    unittest.main()
