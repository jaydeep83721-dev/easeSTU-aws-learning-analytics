import unittest
from scoring import score,intervention
class Tests(unittest.TestCase):
    def test_blank(self):
        r=score([{'answer':0,'topic':'a'},{'answer':1,'topic':'b'}],[0,None]);self.assertEqual(r['percent'],50);self.assertTrue(r['concepts']['b']['needsSupport'])
    def test_invalid(self):
        with self.assertRaises(ValueError):score([{'answer':0,'topic':'a'}],[4])
    def test_groups(self):
        self.assertEqual(intervention(0,0),'NO_ADDITIONAL_SUPPORT');self.assertEqual(intervention(3,4),'WHOLE_CLASS_REVISIT');self.assertEqual(intervention(3,50),'30_MINUTE_SMALL_GROUP')
if __name__=='__main__':unittest.main()
