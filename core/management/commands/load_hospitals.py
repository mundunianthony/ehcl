from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import HealthCenter, User

# Common medical specialties and conditions
# Common medical specialties and conditions
MEDICAL_SPECIALTIES = [
    'General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 
    'Emergency Medicine', 'Internal Medicine', 'Cardiology', 'Dermatology',
    'Neurology', 'Ophthalmology', 'ENT', 'Dental', 'Orthopedics', 
    'Psychiatry', 'Radiology', 'Pathology', 'Urology', 'Nephrology',
    'Endocrinology', 'Gastroenterology', 'Hematology', 'Oncology',
    'Pulmonology', 'Rheumatology', 'Infectious Diseases'
]

COMMON_CONDITIONS = [
    'Malaria', 'Typhoid', 'Chest infection (Pneumonia)', 'Urine infection', 
    'Sugar disease (Diabetes)', 'High blood pressure', 'Breathing problems (Asthma)', 
    'Low blood', 'HIV/AIDS', 'TB (Tuberculosis)', 'Running stomach (Diarrhea)', 
    'Bloody diarrhea', 'Lack of food', 'Joint pains', 'Stomach ulcers', 
    'Liver disease', 'Brain fever', 'Stroke (Poko)', 'Heart pain', 
    'Pregnancy problems', 'Broken bones', 'Burns', 'Poison', 'Snake bite', 
    'Accident injuries', 'Red eyes', 'Toothache', 'Skin rashes', 'Mental illness'
]

HOSPITALS_DATA = [
    # Mbarara District (4 hospitals)
    {
        "name": "Mbarara Regional Referral Hospital",
        "description": "A premier regional referral hospital providing comprehensive healthcare services, including advanced surgical procedures, diagnostic imaging, and specialized care for chronic and acute conditions.",
        "address": "Bishop Wills Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Internal Medicine, Cardiology, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diabetes, Hypertension, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "info@mrr.go.ug",
        "phone": "+256 772 123456",
        "image": "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Community Clinic",
        "description": "A community-focused healthcare facility offering primary care, maternal and child health services, and treatment for common infectious diseases.",
        "address": "Nyamitanga Hill, Mbarara",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Urine infection, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "communityclinic@mbr.ug",
        "phone": "+256 752 234567",
        "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Holy Family Hospital Mbarara",
        "description": "A faith-based hospital delivering high-quality medical and surgical care, with a focus on pediatric services, maternal health, and emergency interventions.",
        "address": "Kakiika Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Burns, Stomach ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "holyfamily@mbr.ug",
        "phone": "+256 702 345678",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Women's Clinic",
        "description": "A specialized healthcare facility dedicated to maternal health, gynecology, and family planning, offering prenatal care and treatment for women's health conditions.",
        "address": "Kikagate Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "womensclinic@mbr.ug",
        "phone": "+256 782 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Lira District (4 hospitals)
    {
        "name": "Lira Regional Referral Hospital",
        "description": "A leading referral hospital in Northern Uganda, providing advanced medical, surgical, and diagnostic services for a wide range of acute and chronic conditions.",
        "address": "Lira–Gulu Rd, Lira",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Lira",
        "country": "Uganda",
        "email": "info@lrr.go.ug",
        "phone": "+256 752 012345",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Olive Health Clinic",
        "description": "A private healthcare facility specializing in women's health, minor surgical procedures, and primary care for common ailments.",
        "address": "Health Centre Rd, Lira",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, General Medicine, Family Planning",
        "conditions_treated": "Pregnancy problems, Family planning, Malaria, Typhoid, Stomach ulcers",
        "city": "Lira",
        "country": "Uganda",
        "email": "oliveclinic@lira.ug",
        "phone": "+256 772 123456",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "St. Charles Lwanga Hospital",
        "description": "A faith-based hospital offering comprehensive medical and surgical care, with a focus on maternal and pediatric health services.",
        "address": "Adiko Rd, Lira",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Burns, Stomach ulcers",
        "city": "Lira",
        "country": "Uganda",
        "email": "stcharles@lwanga.ug",
        "phone": "+256 772 234567",
        "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Lira Medical Centre",
        "description": "A general healthcare facility providing outpatient care, diagnostic services, and treatment for common medical conditions.",
        "address": "Obote Avenue, Lira",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Internal Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diarrhea, Stomach ulcers",
        "city": "Lira",
        "country": "Uganda",
        "email": "info@liramedical.ug",
        "phone": "+256 772 345678",
        "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Kampala District (4 hospitals)
    {
        "name": "Mulago National Referral Hospital",
        "description": "Uganda's largest national referral hospital, offering advanced medical, surgical, and specialized care across multiple disciplines, including diagnostics and emergency services.",
        "address": "Mulago Hill, Kampala",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Cardiology, Neurology, Oncology, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diabetes, Hypertension, HIV/AIDS, TB, Cancer, Broken bones, Stomach ulcers",
        "city": "Kampala",
        "country": "Uganda",
        "email": "info@mulago.go.ug",
        "phone": "+256 772 987654",
        "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Nsambya Hospital",
        "description": "A leading faith-based hospital providing comprehensive medical, surgical, and maternal health services, with a focus on high-quality patient care.",
        "address": "Nsambya Rd, Kampala",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kampala",
        "country": "Uganda",
        "email": "info@nsambyahospital.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kampala International Hospital",
        "description": "A private hospital offering specialized medical services, diagnostic imaging, and emergency care for acute and chronic conditions.",
        "address": "Namuwongo Rd, Kampala",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Internal Medicine, Emergency Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diabetes, Hypertension, Stomach ulcers",
        "city": "Kampala",
        "country": "Uganda",
        "email": "info@kih.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kampala Women's Clinic",
        "description": "A specialized healthcare facility providing maternal health, gynecological care, and family planning services, with a focus on women's wellness.",
        "address": "Bukoto Rd, Kampala",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Kampala",
        "country": "Uganda",
        "email": "info@kampalawomens.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Jinja District (4 hospitals)
    {
        "name": "Jinja Regional Referral Hospital",
        "description": "A major referral hospital in Eastern Uganda, offering advanced medical, surgical, and diagnostic services for a wide range of conditions.",
        "address": "Jinja Main Street, Jinja",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Jinja",
        "country": "Uganda",
        "email": "info@jinjahospital.go.ug",
        "phone": "+256 772 345678",
        "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Jinja General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common medical conditions.",
        "address": "Nile Avenue, Jinja",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Jinja",
        "country": "Uganda",
        "email": "info@jinjageneral.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Jinja Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Busoga Rd, Jinja",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Jinja",
        "country": "Uganda",
        "email": "info@jinjacommunity.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Jinja Eye Care Clinic",
        "description": "A specialized healthcare facility providing ophthalmology services, vision care, and treatment for eye-related conditions.",
        "address": "Main Street, Jinja",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Ophthalmology, Optometry",
        "conditions_treated": "Red eyes, Poor eyesight, Eye infections, Stomach ulcers",
        "city": "Jinja",
        "country": "Uganda",
        "email": "info@jinjaeyecare.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Gulu District (4 hospitals)
    {
        "name": "Gulu Regional Referral Hospital",
        "description": "A leading referral hospital in Northern Uganda, providing advanced medical, surgical, and emergency services for acute and chronic conditions.",
        "address": "Gulu-Lira Rd, Gulu",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Gulu",
        "country": "Uganda",
        "email": "info@guluhospital.go.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "St. Mary's Hospital Lacor",
        "description": "A faith-based hospital offering comprehensive medical, surgical, and pediatric care, with a focus on high-quality patient outcomes.",
        "address": "Lacor Rd, Gulu",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Gulu",
        "country": "Uganda",
        "email": "info@lacorhospital.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Gulu Community Clinic",
        "description": "A community-based healthcare facility providing primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Pece Rd, Gulu",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Gulu",
        "country": "Uganda",
        "email": "info@gulucommunity.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Gulu Dental Clinic",
        "description": "A specialized healthcare facility offering dental care, oral surgery, and treatment for oral health conditions.",
        "address": "Aworanga Rd, Gulu",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Dental, Oral Surgery",
        "conditions_treated": "Toothache, Gum disease, Tooth removal, Stomach ulcers",
        "city": "Gulu",
        "country": "Uganda",
        "email": "info@guludental.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Mbale District (4 hospitals)
    {
        "name": "Mbale Regional Referral Hospital",
        "description": "A key referral hospital in Eastern Uganda, offering advanced medical, surgical, and diagnostic services for a wide range of conditions.",
        "address": "Pallisa Rd, Mbale",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology, Pathology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Mbale",
        "country": "Uganda",
        "email": "info@mbalehospital.go.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbale General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Republic St, Mbale",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Mbale",
        "country": "Uganda",
        "email": "info@mbalegeneral.ug",
        "phone": "+256 772 678901",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbale Community Clinic",
        "description": "A community-focused healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Kumi Rd, Mbale",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Mbale",
        "country": "Uganda",
        "email": "info@mbalecommunity.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbale Eye Care Clinic",
        "description": "A specialized healthcare facility providing ophthalmology services, vision care, and treatment for eye-related conditions.",
        "address": "Cathedral Ave, Mbale",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Ophthalmology, Optometry",
        "conditions_treated": "Red eyes, Poor eyesight, Eye infections, Stomach ulcers",
        "city": "Mbale",
        "country": "Uganda",
        "email": "info@mbaleeyecare.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Arua District (4 hospitals)
    {
        "name": "Arua Regional Referral Hospital",
        "description": "A major referral hospital in West Nile, providing advanced medical, surgical, and emergency services for acute and chronic conditions.",
        "address": "Arua Town, Arua",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Infectious Diseases",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Snake bite, Stomach ulcers",
        "city": "Arua",
        "country": "Uganda",
        "email": "info@aruahospital.go.ug",
        "phone": "+256 772 678901",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Arua General Hospital",
        "description": "A general hospital offering outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Awindiri Rd, Arua",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Arua",
        "country": "Uganda",
        "email": "info@aruageneral.ug",
        "phone": "+256 772 789012",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Arua Community Clinic",
        "description": "A community-based healthcare facility providing primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Ediofe Rd, Arua",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Arua",
        "country": "Uganda",
        "email": "info@aruacommunity.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Arua Dental Clinic",
        "description": "A specialized healthcare facility offering dental care, oral surgery, and treatment for oral health conditions.",
        "address": "Weatherhead Lane, Arua",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Dental, Oral Surgery",
        "conditions_treated": "Toothache, Gum disease, Tooth removal, Stomach ulcers",
        "city": "Arua",
        "country": "Uganda",
        "email": "info@aruadental.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Fort Portal District (4 hospitals)
    {
        "name": "Fort Portal Regional Referral Hospital",
        "description": "A leading referral hospital in Western Uganda, offering advanced medical, surgical, and diagnostic services for a wide range of conditions.",
        "address": "Fort Portal Town, Kabarole",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Cardiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diabetes, Hypertension, HIV/AIDS, TB, Pregnancy problems, Broken bones, Heart pain, Stomach ulcers",
        "city": "Fort Portal",
        "country": "Uganda",
        "email": "info@fortportalhospital.go.ug",
        "phone": "+256 772 789012",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Fort Portal General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Boma Rd, Fort Portal",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Fort Portal",
        "country": "Uganda",
        "email": "info@fortgeneral.ug",
        "phone": "+256 772 890123",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Fort Portal Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Kasese Rd, Fort Portal",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Fort Portal",
        "country": "Uganda",
        "email": "info@fortcommunity.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Fort Portal Women's Clinic",
        "description": "A specialized healthcare facility providing maternal health, gynecological care, and family planning services.",
        "address": "Mpanga Rd, Fort Portal",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Fort Portal",
        "country": "Uganda",
        "email": "info@fortwomens.ug",
        "phone": "+256 782 012345",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Hoima District (4 hospitals)
    {
        "name": "Hoima Regional Referral Hospital",
        "description": "A regional referral hospital serving the Bunyoro sub-region, offering comprehensive medical, surgical, and diagnostic services.",
        "address": "Hoima Town, Hoima",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Pathology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Hoima",
        "country": "Uganda",
        "email": "info@hoimahospital.go.ug",
        "phone": "+256 782 567890",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Hoima General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Main St, Hoima",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Hoima",
        "country": "Uganda",
        "email": "info@hoimageneral.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Hoima Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Kampala Rd, Hoima",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Hoima",
        "country": "Uganda",
        "email": "info@hoimacommunity.0ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Hoima Dental Clinic",
        "description": "A specialized healthcare facility offering dental care, oral surgery, and treatment for oral health conditions.",
        "address": "Bunyoro Rd, Hoima",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Dental, Oral Surgery",
        "conditions_treated": "Toothache, Gum disease, Tooth removal, Stomach ulcers",
        "city": "Hoima",
        "country": "Uganda",
        "email": "info@hoimadental.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Masaka District (4 hospitals)
    {
        "name": "Masaka Regional Referral Hospital",
        "description": "A regional referral hospital serving the Central region, offering advanced medical, surgical, and diagnostic services.",
        "address": "Masaka Town, Masaka",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Pathology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Diabetes, Hypertension, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Masaka",
        "country": "Uganda",
        "email": "info@masakahospital.go.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masaka General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Elgin St, Masaka",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Masaka",
        "country": "Uganda",
        "email": "info@masakageneral.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masaka Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Kampala Rd, Masaka",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Masaka",
        "country": "Uganda",
        "email": "info@masakacommunity.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masaka Women's Clinic",
        "description": "A specialized healthcare facility providing maternal health, gynecological care, and family planning services.",
        "address": "Kizungu Rd, Masaka",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Masaka",
        "country": "Uganda",
        "email": "info@masakawomens.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Soroti District (4 hospitals)
    {
        "name": "Soroti Regional Referral Hospital",
        "description": "A regional hospital serving the Teso sub-region, offering advanced medical, surgical, and diagnostic services.",
        "address": "Soroti Town, Soroti",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Pathology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Soroti",
        "country": "Uganda",
        "email": "info@sorotihospital.go.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Soroti General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Gweri Rd, Soroti",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Soroti",
        "country": "Uganda",
        "email": "info@sorotigeneral.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Soroti Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Lira Rd, Soroti",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Soroti",
        "country": "Uganda",
        "email": "info@soroticommunity.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Soroti Eye Care Clinic",
        "description": "A specialized healthcare facility providing ophthalmology services, vision care, and treatment for eye-related conditions.",
        "address": "Moroto Rd, Soroti",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Ophthalmology, Optometry",
        "conditions_treated": "Red eyes, Poor eyesight, Eye infections, Stomach ulcers",
        "city": "Soroti",
        "country": "Uganda",
        "email": "info@sorotieyecare.ug",
        "phone": "+256 782 012345",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Moroto District (4 hospitals)
    {
        "name": "Moroto Regional Referral Hospital",
        "description": "A regional referral hospital serving the Karamoja sub-region, offering comprehensive medical, surgical, and diagnostic services, with a focus on nutrition and infectious diseases.",
        "address": "Moroto Town, Moroto",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Nutrition",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Malnutrition, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Moroto",
        "country": "Uganda",
        "email": "info@mrr.go.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Moroto General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Loputuk Rd, Moroto",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Moroto",
        "country": "Uganda",
        "email": "info@morotogeneral.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Moroto Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases, with a focus on nutrition.",
        "address": "Nakiloro Rd, Moroto",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology, Nutrition",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Malnutrition, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Moroto",
        "country": "Uganda",
        "email": "info@morotocommunity.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Moroto Nutrition Clinic",
        "description": "A specialized healthcare facility providing nutritional support, maternal health, and treatment for malnutrition-related conditions.",
        "address": "Rupa Rd, Moroto",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Nutrition, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malnutrition, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Moroto",
        "country": "Uganda",
        "email": "info@morotonutrition.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Kasese District (4 hospitals)
    {
        "name": "Kasese Regional Referral Hospital",
        "description": "A regional referral hospital serving the Rwenzori region, offering advanced medical, surgical, and diagnostic services, with specialized burn care.",
        "address": "Kasese Town, Kasese",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Orthopedics, Radiology, Burn Care",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Burns, Stomach ulcers",
        "city": "Kasese",
        "country": "Uganda",
        "email": "info@krr.go.ug",
        "phone": "+256 772 345678",
        "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kasese General Hospital",
        "description": "A general hospital providing outpatient and inpatient care, including surgical and maternal health services for common conditions.",
        "address": "Kilembe Rd, Kasese",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kasese",
        "country": "Uganda",
        "email": "info@kasesegeneral.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kasese Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Rwenzori Rd, Kasese",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Kasese",
        "country": "Uganda",
        "email": "info@kasesecommunity.ug",
        "phone": "+256 782 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kasese Burn Care Clinic",
        "description": "A specialized healthcare facility providing burn care, wound management, and treatment for related conditions.",
        "address": "Hima Rd, Kasese",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Burn Care, Surgery, Emergency Medicine",
        "conditions_treated": "Burns, Accident injuries, Stomach ulcers",
        "city": "Kasese",
        "country": "Uganda",
        "email": "info@kaseseburncare.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Kamuli District (4 hospitals)
    {
        "name": "Kamuli General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Kamuli district.",
        "address": "Kamuli Town, Kamuli",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kamuli",
        "country": "Uganda",
        "email": "info@kamiluhospital.go.ug",
        "phone": "+256 782 890123",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kamuli Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Busoga Rd, Kamuli",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kamuli",
        "country": "Uganda",
        "email": "info@kamulimission.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kamuli Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Namasagali Rd, Kamuli",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Kamuli",
        "country": "Uganda",
        "email": "info@kamulicommunity.ug",
        "phone": "+256 782 012345",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kamuli Women's Clinic",
        "description": "A specialized healthcare facility providing maternal health, gynecological care, and family planning services.",
        "address": "Kitayunjwa Rd, Kamuli",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Kamuli",
        "country": "Uganda",
        "email": "info@kamuliwomens.ug",
        "phone": "+256 782 123456",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Iganga District (4 hospitals)
    {
        "name": "Iganga General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Iganga district.",
        "address": "Iganga Town, Iganga",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Iganga",
        "country": "Uganda",
        "email": "info@igangahospital.go.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Iganga Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Busoga Rd, Iganga",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Iganga",
        "country": "Uganda",
        "email": "info@igangamission.ug",
        "phone": "+256 772 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Iganga Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Nakalama Rd, Iganga",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Iganga",
        "country": "Uganda",
        "email": "info@igangacommunity.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Iganga Eye Care Clinic",
        "description": "A specialized healthcare facility providing ophthalmology services, vision care, and treatment for eye-related conditions.",
        "address": "Main St, Iganga",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Ophthalmology, Optometry",
        "conditions_treated": "Red eyes, Poor eyesight, Eye infections, Stomach ulcers",
        "city": "Iganga",
        "country": "Uganda",
        "email": "info@igangaeyecare.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Kitgum District (4 hospitals)
    {
        "name": "Kitgum General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Kitgum district.",
        "address": "Kitgum Town, Kitgum",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology, Mental Health Services",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Mental illness, Stomach ulcers",
        "city": "Kitgum",
        "country": "Uganda",
        "email": "info@kitgumhospital.go.ug",
        "phone": "+256 782 456780",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kitgum Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Pandwong Rd, Kitgum",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kitgum",
        "country": "Uganda",
        "email": "info@kitgummission.ug",
        "phone": "+256 782 567890",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kitgum Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Lakwor Rd, Kitgum",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Kitgum",
        "country": "Uganda",
        "email": "info@kitgumcommunity.ug",
        "phone": "+256 782 678901",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kitgum Mental Health Clinic",
        "description": "A specialized healthcare facility providing mental health services, counseling, and treatment for psychiatric conditions.",
        "address": "Gulu Rd, Kitgum",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Psychiatry, Mental Health Services",
        "conditions_treated": "Mental illness, Depression, Anxiety, Stomach ulcers",
        "city": "Kitgum",
        "country": "Uganda",
        "email": "info@kitgummh.ug",
        "phone": "+256 782 789012",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Nebbi District (4 hospitals)
    {
        "name": "Nebbi General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Nebbi district.",
        "address": "Nebbi Town, Nebbi",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology, Physiotherapy",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Nebbi",
        "country": "Uganda",
        "email": "info@nebbihospital.go.ug",
        "phone": "+256 782 012345",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Nebbi Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Pakwach Rd, Nebbi",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Nebbi",
        "country": "Uganda",
        "email": "info@nebbimission.ug",
        "phone": "+256 782 123456",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Nebbi Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Arua Rd, Nebbi",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Nebbi",
        "country": "Uganda",
        "email": "info@nebbicommunity.ug",
        "phone": "+256 782 234567",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Nebbi Women's Clinic",
        "description": "A specialized healthcare facility providing maternal health, gynecological care, and family planning services.",
        "address": "Panyimur Rd, Nebbi",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Family Planning, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy problems, Infertility, Family planning, Stomach ulcers",
        "city": "Nebbi",
        "country": "Uganda",
        "email": "info@nebbiwomens.ug",
        "phone": "+256 782 345678",
        "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Masindi District (4 hospitals)
    {
        "name": "Masindi General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Masindi district.",
        "address": "Masindi Town, Masindi",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology, Dental Services",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Toothache, Stomach ulcers",
        "city": "Masindi",
        "country": "Uganda",
        "email": "info@masindihospital.go.ug",
        "phone": "+256 782 123450",
        "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masindi Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Hoima Rd, Masindi",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Masindi",
        "country": "Uganda",
        "email": "info@masindimission.ug",
        "phone": "+256 782 234567",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masindi Community Clinic",
        "description": "A community-based healthcare facility offering primary care, maternal health, and treatment for common infectious diseases.",
        "address": "Kampala Rd, Masindi",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Diarrhea, Stomach ulcers",
        "city": "Masindi",
        "country": "Uganda",
        "email": "info@masindicommunity.ug",
        "phone": "+256 782 345678",
        "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Masindi Dental Clinic",
        "description": "A specialized healthcare facility offering dental care, oral surgery, and treatment for oral health conditions.",
        "address": "Port Rd, Masindi",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Dental, Oral Surgery",
        "conditions_treated": "Toothache, Gum disease, Tooth removal, Stomach ulcers",
        "city": "Masindi",
        "country": "Uganda",
        "email": "info@masindidental.ug",
        "phone": "+256 782 456789",
        "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Kisoro District (4 hospitals)
    {
        "name": "Kisoro General Hospital",
        "description": "A general hospital providing comprehensive medical, surgical, and maternal health services for the Kisoro district.",
        "address": "Kisoro Town, Kisoro",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Radiology",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, HIV/AIDS, TB, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kisoro",
        "country": "Uganda",
        "email": "info@kisorohospital.go.ug",
        "phone": "+256 782 901234",
        "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Kisoro Mission Hospital",
        "description": "A faith-based hospital offering medical, surgical, and maternal health services, with a focus on community healthcare.",
        "address": "Mutolere Rd, Kisoro",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Pneumonia, Pregnancy problems, Broken bones, Stomach ulcers",
        "city": "Kisoro",
        "country": "Uganda",
        "email": "info@kisoromission.ug",
        "phone": "+256 782 012345",
        "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
]


class Command(BaseCommand):
    help = 'Load initial hospital data'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        credentials = []
        
        for hospital_data in HOSPITALS_DATA:
            # Make a copy to avoid modifying the original dict
            data = hospital_data.copy()
            
            # Handle district field - map to city if city is not set
            district = data.pop('district', None)
            if district and 'city' not in data:
                data['city'] = district
                
            # Remove any unwanted fields
            data.pop('id', None)
            data.pop('latitude', None)
            data.pop('longitude', None)
            
            # Handle image URL
            if 'image' in data:
                data['image'] = data.pop('image')
                
            # Set default values for new fields if not provided
            hospital_data.setdefault('is_emergency', True)
            hospital_data.setdefault('has_ambulance', False)
            hospital_data.setdefault('has_pharmacy', True)
            hospital_data.setdefault('has_lab', False)
            
            # Set default specialties and conditions for hospitals that don't have them
            if 'specialties' not in hospital_data:
                hospital_data['specialties'] = 'General Medicine, Emergency Medicine'
            if 'conditions_treated' not in hospital_data:
                hospital_data['conditions_treated'] = 'Malaria, Typhoid, Chest infection, Urine infection, Sugar disease, High blood pressure, Breathing problems, HIV/AIDS, TB, Stroke (Poko), Heart pain, Pregnancy problems, Broken bones, Burns'
            
            # Generate unique admin email and password for the hospital
            # Create a shorter slug by taking first 3 words and limiting length
            name_words = data['name'].split()[:3]  # Take first 3 words
            short_name = ' '.join(name_words)
            slug = slugify(short_name)[:15]  # Limit to 15 characters
            slug = slug.replace('-', '')  # Remove dashes
            admin_email = f"admin.{slug}@hospital.com"
            admin_password = "password1234"
            
            # Create or get the user
            user, user_created = User.objects.get_or_create(
                email=admin_email,
                defaults={"is_staff": True, "name": data['name']}
            )
            if user_created:
                user.set_password(admin_password)
                user.save()
            
            # Try to find existing hospital by name and address
            name = data['name']
            address = data['address']
            
            try:
                hospital = HealthCenter.objects.get(name=name, address=address)
                # Update existing hospital
                for key, value in data.items():
                    setattr(hospital, key, value)
                hospital.hospital_user = user
                hospital.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated hospital: {name}'))
            except HealthCenter.DoesNotExist:
                # Create new hospital
                hospital = HealthCenter.objects.create(**data, hospital_user=user)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created hospital: {name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing {name}: {str(e)}'))
            credentials.append((name, admin_email, admin_password))

        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {len(HOSPITALS_DATA)} hospitals. '
                             f'Created: {created_count}, Updated: {updated_count}')
        )
        self.stdout.write(self.style.WARNING('\nHospital Login Credentials:'))
        for name, email, password in credentials:
            self.stdout.write(f"{name}:\n  Email: {email}\n  Password: {password}\n")