from django.core.management.base import BaseCommand
from core.models import HealthCenter

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
    'Malaria', 'Typhoid', 'Chest infection (Pneumonia)', 'Urine infection', 'Sugar disease (Diabetes)', 'High blood pressure',
    'Breathing problems (Asthma)', 'Low blood', 'HIV/AIDS', 'TB (Tuberculosis)', 'Running stomach (Diarrhea)', 'Bloody diarrhea',
    'Lack of food', 'Joint pains', 'Stomach ulcers', 'Liver disease', 'Brain fever',
    'Stroke (Poko)', 'Heart pain', 'Pregnancy problems', 'Broken bones',
    'Burns', 'Poison', 'Snake bite', 'Accident injuries',
    'Red eyes', 'Toothache', 'Skin rashes', 'Mental illness'
]

HOSPITALS_DATA = [
    {
        "name": "Mbarara Regional Referral Hospital",
        "description": "Main government referral facility offering comprehensive services.",
        "address": "Bishop Wills Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency Medicine, Internal Medicine, Cardiology, Neurology, Orthopedics, Radiology",
        "conditions_treated": "Malaria, Typhoid, Chest infection, Urine infection, Sugar disease, High blood pressure, Breathing problems, HIV/AIDS, TB, Stroke (Poko), Heart pain, Pregnancy problems, Broken bones, Burns, Ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "info@mrr.go.ug",
        "phone": "+256 772 123456",
        "image": "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Community Clinic",
        "description": "Local clinic with outpatient and maternal care.",
        "address": "Nyamitanga Hill, Mbarara",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology, Emergency Medicine",
        "conditions_treated": "Malaria, Typhoid, Chest infection, Urine infection, Sugar disease, High blood pressure, Pregnancy problems, Small wounds, Ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "communityclinic@mbr.ug",
        "phone": "+256 752 234567",
        "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "St. Francis Hospital Rubaga",
        "description": "Catholic-run hospital focusing on surgery and pediatrics.",
        "address": "Kakiika, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, General Medicine, Emergency Medicine",
        "conditions_treated": "Malaria, Cough & cold, Running stomach, Small wounds, Pregnancy care, Child sickness, Ulcers",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "stfrancis@rubagahospital.org",
        "phone": "+256 702 345678",
        "image": "https://images.pexels.com/photos/668298/pexels-photo-668298.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Lake Mburo Health Center",
        "description": "Health center serving local communities around Lake Mburo.",
        "address": "Lake Mburo Rd, Mbarara",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "General Medicine, Primary Care, Maternal Health, Pediatrics",
        "conditions_treated": "Operations, Accident injuries, Broken bones, General surgery, Emergency care, After-surgery care",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "info@lakemburohc.ug",
        "phone": "+256 772 456789",
        "image": "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Women’s Hospital",
        "description": "Specialized maternity and gynecology services.",
        "address": "Kikagate Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Obstetrics & Gynecology, Neonatology, Infertility, Family Planning, Gynecological Surgery, Maternal-Fetal Medicine",
        "conditions_treated": "Pregnancy & childbirth, Trouble getting pregnant, Women's health problems, Family planning, Difficult pregnancy, Newborn care",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "womenshospital@mbr.ug",
        "phone": "+256 782 567890",
        "image": "https://images.pexels.com/photos/29185335/pexels-photo-29185335/free-photo-of-helicopter-landing-on-hospital-rooftop-in-merano.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Cancer Center",
        "description": "Oncology unit providing cancer diagnostics and treatment.",
        "address": "Bishop Wills Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Oncology, Radiation Oncology, Medical Oncology, Surgical Oncology, Palliative Care, Hematology",
        "conditions_treated": "All Types of Cancer, Blood Disorders, Tumor Management, Pain Management, Chemotherapy, Radiation Therapy",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "cancercenter@mrr.go.ug",
        "phone": "+256 312 123456",
        "image": "https://images.pexels.com/photos/6473188/pexels-photo-6473188.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Eye Care Clinic",
        "description": "Specialist clinic for ophthalmology and vision care.",
        "address": "Bishop Stuart Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "Ophthalmology, Optometry, Cornea & External Disease, Retina, Glaucoma, Pediatric Ophthalmology",
        "conditions_treated": "Red eyes, Cloudy eyes, Eye pressure, Poor eyesight, Eye injuries, Blurry vision",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "eyecare@mbr.ug",
        "phone": "+256 772 678901",
        "image": "https://images.pexels.com/photos/13018111/pexels-photo-13018111.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Rubaga Dental Clinic",
        "description": "Dental services including orthodontics.",
        "address": "Kakiika Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": False,
        "specialties": "General Dentistry, Orthodontics, Oral Surgery, Periodontics, Endodontics, Pediatric Dentistry",
        "conditions_treated": "Teeth check-up, Tooth removal, Tooth fillings, Tooth nerve treatment, Teeth cleaning, Mouth care",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "dental@rubagaclinic.ug",
        "phone": "+256 702 789012",
        "image": "https://images.pexels.com/photos/20421997/pexels-photo-20421997/free-photo-of-trees-and-palm-trees-over-fatebenefratelli-hospital-in-rome.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Pediatric Hospital",
        "description": "Child-focused inpatient and outpatient medical care.",
        "address": "Nyamityobora Rd, Mbarara",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Pediatrics, Neonatology, Pediatric Surgery, Pediatric Cardiology, Pediatric Neurology, Pediatric Emergency Medicine",
        "conditions_treated": "Child sickness, Newborn care, Child growth checks, Child immunizations, Child emergencies, Child infections",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "pediatrics@mbrhosp.ug",
        "phone": "+256 752 890123",
        "image": "https://images.pexels.com/photos/13908100/pexels-photo-13908100.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        "name": "Mbarara Skin & Allergy Center",
        "description": "Dermatology and allergy diagnostics.",
        "address": "Kakyeka Rd, Mbarara",
        "is_emergency": False,
        "has_ambulance": False,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "Dermatology, Allergy & Immunology, Cosmetic Dermatology, Pediatric Dermatology, Dermatologic Surgery, Contact Dermatitis",
        "conditions_treated": "Skin rashes, Allergies, Skin infections, Hair & nail problems, Child skin problems, Skin beauty care",
        "city": "Mbarara",
        "country": "Uganda",
        "email": "skincenter@mbr.ug",
        "phone": "+256 702 901234",
        "image": "https://images.pexels.com/photos/2734622/pexels-photo-2734622.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    # Lira District Hospitals (011-020)
    {
        "name": "Lira Regional Referral Hospital",
        "description": "Primary referral for Northern Uganda with full acute services.",
        "address": "Lira–Gulu Rd, Lira",
        "is_emergency": True,
        "has_ambulance": True,
        "has_pharmacy": True,
        "has_lab": True,
        "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology",
        "conditions_treated": "Accident injuries, Infections, Pregnancy & child care, Operations, Long-term sickness, Emergency care, Broken bones, Medical tests",
        "city": "Lira",
        "country": "Uganda",
        "email": "info@lrr.go.ug",
        "phone": "+256 752 012345",
        "image": "https://via.placeholder.com/600x300?text=Lira+Referral"
    },
    # ... Continue with remaining hospitals


  {
    "id": 12,
    "name": "Olive Health Clinic",
    "district": "Lira",
    "description": "Private clinic specializing in women's health and minor surgeries.",
    "is_emergency": False,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Obstetrics & Gynecology, Family Medicine, General Surgery, Family Planning, Maternal Health, Minor Surgical Procedures",
    "conditions_treated": "Pregnancy care, Family planning, Women's health problems, Small operations, General sickness, Women's health check",
    "email": "oliveclinic@lira.ug",
    "phone": "+256 772 123456",
    "address": "Health Centre Rd, Lira",
    "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 13,
    "name": "St. Charles Lwanga Hospital",
    "district": "Lira",
    "description": "Faith-based hospital with surgical and maternity wards.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Surgery, Obstetrics & Gynecology, Pediatrics, Internal Medicine, Emergency Medicine, Orthopedics, Anesthesia, Radiology",
    "conditions_treated": "Operations, Child sickness, Pregnancy care, General sickness, Broken bones, Burns, Infections, Ulcers",
    "address": "Adiko Rd, Lira",
    "email": "stcharles@lwanga.ug",
    "phone": "+256 772 234567",
    "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 14,
    "name": "Lira Medical Centre",
    "district": "Lira",
    "description": "General outpatient and diagnostic services.",
    "is_emergency": False,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Family Medicine, Pediatrics, Internal Medicine, Diagnostic Services, Laboratory Services, Radiology",
    "conditions_treated": "General sickness, Long-term sickness, Infections, Medical tests, Small health problems, Health check-up, Ulcers",
    "address": "Obote Avenue, Lira",
    "email": "info@liramedical.ug",
    "phone": "+256 772 345678",
    "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 15,
    "name": "Lira Women’s Hospital",
    "district": "Lira",
    "description": "Specializing in obstetrics and gynecology.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Obstetrics, Gynecology, Neonatology, Infertility, Gynecological Surgery, Maternal-Fetal Medicine, Family Planning",
    "conditions_treated": "Pregnancy & childbirth, Infertility, Gynecological Disorders, High-Risk Pregnancies, Neonatal Care, Family Planning Services, Ulcers",
    "address": "Ojwina Division, Lira",
    "email": "info@lirawomen.ug",
    "phone": "+256 772 456789",
    "image": "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 16,
    "name": "Holy Cross Health Centre",
    "district": "Lira",
    "is_emergency": False,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Primary Health Care, Maternal & Child Health, General Medicine, Community Health, Family Planning, Immunization",
    "conditions_treated": "Common Illnesses, Maternal & Child Health, Minor Injuries, Immunizations, Family Planning, Basic Health Services, Ulcers",
    "description": "Catholic-run clinic for children and maternal health.",
    "address": "Barogole, Lira",
    "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 17,
    "name": "Lira Vision Eye Centre",
    "district": "Lira",
    "description": "Ophthalmology services and eye surgery.",
    "is_emergency": True,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": False,
    "specialties": "Ophthalmology, Optometry, Cataract Surgery, Glaucoma, Retinal Diseases, Pediatric Ophthalmology, Oculoplastic Surgery",
    "conditions_treated": "Eye tests, Cloudy eye operation, Eye pressure treatment, Poor eyesight, Eye problems from sugar disease, Eye Infections, Eye Trauma, Ulcers",
    "email": "vision@liraeyecare.ug",
    "phone": "+256 752 234567",
    "address": "Main Street, Lira",
    "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 18,
    "name": "Hope Dental Clinic",
    "district": "Lira",
    "description": "Affordable dental services for the community.",
    "is_emergency": True,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": False,
    "specialties": "General Dentistry, Restorative Dentistry, Oral Surgery, Periodontics, Pediatric Dentistry, Dental Prosthetics",
    "conditions_treated": "Tooth decay, Gum disease, Tooth removal, Tooth nerve treatment, False teeth, Teeth cleaning, Dentures, Ulcers",
    "address": "Amuca Rd, Lira",
    "email": "info@hopedental.ug",
    "phone": "+256 782 123456",
    "image": "https://images.pexels.com/photos/13018111/pexels-photo-13018111.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 19,
    "name": "Faith Medical Services",
    "district": "Lira",
    "description": "Private health center with 24/7 emergency care.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Emergency Medicine, General Practice, Pediatrics, Internal Medicine, Minor Surgery, Trauma Care",
    "conditions_treated": "Medical Emergencies, Trauma, Acute Illnesses, Chronic Disease Management, Minor Surgical Procedures, Diagnostic Services, Ulcers",
    "address": "Corner Kilak Rd, Lira",
    "email": "info@faithmedical.ug",
    "phone": "+256 782 234567",
    "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 20,
    "name": "Lira Skin & Allergy Clinic",
    "district": "Lira",
    "description": "Specialist dermatology and allergy care.",
    "is_emergency": False,
    "has_ambulance": False,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Dermatology, Allergy & Immunology, Cosmetic Dermatology, Pediatric Dermatology, Dermatologic Surgery, Contact Dermatitis",
    "conditions_treated": "Eczema, Psoriasis, Acne, Skin Infections, Allergic Reactions, Skin Cancer, Hair & Nail Disorders, Allergy Testing & Treatment, Ulcers",
    "address": "Boroboro Rd, Lira",
    "email": "info@liraskinclinic.ug",
    "phone": "+256 782 345678",
    "image": "https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 21,
    "name": "Lira Children’s Hospital",
    "district": "Lira",
    "description": "Pediatric care facility for infants and children.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "Pediatrics, Neonatology, Pediatric Surgery, Pediatric Cardiology, Pediatric Neurology, Pediatric Emergency Medicine",
    "conditions_treated": "Childhood Illnesses, Neonatal Care, Pediatric Emergencies, Congenital Disorders, Growth & Development Issues, Pediatric Infections, Malnutrition, Ulcers",
    "address": "Railway Station Rd, Lira",
    "email": "info@lirachildrens.ug",
    "phone": "+256 782 456789",
    "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 22,
    "name": "Hoima Regional Referral Hospital",
    "district": "Hoima",
    "description": "Regional referral hospital serving the Bunyoro sub-region.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology, Anesthesia",
    "conditions_treated": "Trauma, Infectious Diseases, Maternal & Child Health, Surgical Conditions, Chronic Diseases, Emergency Care, Fractures, Diagnostic Services, Malaria, HIV/AIDS, Ulcers",
    "address": "Hoima Town, Hoima",
    "email": "info@hoimahospital.go.ug",
    "phone": "+256 782 567890",
    "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 23,
    "name": "Masaka Regional Referral Hospital",
    "district": "Masaka",
    "description": "Referral hospital serving the Central region.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology, Anesthesia",
    "conditions_treated": "Trauma, Infectious Diseases, Maternal & Child Health, Surgical Conditions, Chronic Diseases, Emergency Care, Fractures, Diagnostic Services, Diabetes, Hypertension, Ulcers",
    "address": "Masaka Town, Masaka",
    "email": "info@masakahospital.go.ug",
    "phone": "+256 782 678901",
    "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 24,
    "name": "Soroti Regional Referral Hospital",
    "district": "Soroti",
    "description": "Regional hospital offering specialized care to the Teso sub-region.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology, Anesthesia",
    "conditions_treated": "Trauma, Infectious Diseases, Maternal & Child Health, Surgical Conditions, Chronic Diseases, Emergency Care, Fractures, Diagnostic Services, Malaria, Tuberculosis, Ulcers",
    "address": "Soroti Town, Soroti",
    "email": "info@sorotihospital.go.ug",
    "phone": "+256 782 789012",
    "image": "https://images.pexels.com/photos/5726705/pexels-photo-5726705.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 25,
    "name": "Kamuli General Hospital",
    "district": "Kamuli",
    "description": "General hospital serving Kamuli district and surrounding areas.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Ulcers",
    "address": "Kamuli Town, Kamuli",
    "email": "info@kamiluhospital.go.ug",
    "phone": "+256 782 890123",
    "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 26,
    "name": "Iganga General Hospital",
    "district": "Iganga",
    "description": "General hospital providing outpatient and inpatient services.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Ulcers",
    "address": "Iganga Town, Iganga",
    "image": "https://via.placeholder.com/600x300?text=Iganga+Hospital"
  },
  {
    "id": 27,
    "name": "Kisoro Hospital",
    "district": "Kisoro",
    "description": "District hospital offering essential health services to Kisoro residents.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Malaria, HIV/AIDS, Tuberculosis, Ulcers",
    "address": "Kisoro Town, Kisoro",
    "email": "info@kisorohospital.go.ug",
    "phone": "+256 782 901234",
    "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 28,
    "name": "Nebbi General Hospital",
    "district": "Nebbi",
    "description": "General hospital serving Nebbi district and surrounding communities.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Physiotherapy",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Rehabilitation Services, Malaria, Ulcers",
    "address": "Nebbi Town, Nebbi",
    "email": "info@nebbihospital.go.ug",
    "phone": "+256 782 012345",
    "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 29,
    "name": "Masindi General Hospital",
    "district": "Masindi",
    "description": "Hospital offering general medical and surgical services.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Dental Services",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Dental Problems, Malaria, HIV/AIDS, Ulcers",
    "address": "Masindi Town, Masindi",
    "email": "info@masindihospital.go.ug",
    "phone": "+256 782 123450",
    "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 30,
    "name": "Bundibugyo General Hospital",
    "district": "Bundibugyo",
    "description": "General hospital serving Bundibugyo district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Eye Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Eye Problems, Malaria, Malnutrition, Ulcers",
    "address": "Bundibugyo Town, Bundibugyo",
    "email": "info@bundibugyohospital.go.ug",
    "phone": "+256 782 234560",
    "image": "https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 31,
    "name": "Kaberamaido General Hospital",
    "district": "Kaberamaido",
    "description": "General hospital providing health services in Kaberamaido district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Dental Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Dental Problems, Malaria, HIV/AIDS, Ulcers",
    "address": "Kaberamaido Town, Kaberamaido",
    "email": "info@kaberamaidohospital.go.ug",
    "phone": "+256 782 345670",
    "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 32,
    "name": "Kitgum General Hospital",
    "district": "Kitgum",
    "description": "District hospital serving Kitgum and surrounding areas.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Mental Health Services",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Mental Health Conditions, Malaria, HIV/AIDS, Ulcers",
    "address": "Kitgum Town, Kitgum",
    "email": "info@kitgumhospital.go.ug",
    "phone": "+256 782 456780",
    "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 33,
    "name": "Moroto Regional Referral Hospital",
    "district": "Moroto",
    "description": "Referral hospital for the Karamoja sub-region.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology, Anesthesia, Nutrition",
    "conditions_treated": "Trauma, Infectious Diseases, Maternal & Child Health, Surgical Conditions, Chronic Diseases, Emergency Care, Fractures, Diagnostic Services, Malnutrition, Malaria, HIV/AIDS, Tuberculosis, Ulcers",
    "address": "Moroto Town, Moroto",
    "email": "info@mrr.go.ug",
    "phone": "+256 772 456789",
    "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 34,
    "name": "Kasese Regional Referral Hospital",
    "district": "Kasese",
    "description": "Referral hospital serving the Rwenzori region.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Orthopedics, Radiology, Pathology, Anesthesia, Burn Care",
    "conditions_treated": "Trauma, Burns, Infectious Diseases, Maternal & Child Health, Surgical Conditions, Chronic Diseases, Emergency Care, Fractures, Diagnostic Services, Malaria, HIV/AIDS, Ulcers",
    "email": "info@krr.go.ug",
    "phone": "+256 772 345678",
    "address": "Kasese Town, Kasese",
    "image": "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 35,
    "name": "Kumi General Hospital",
    "district": "Kumi",
    "description": "General hospital providing health services to Kumi district residents.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Eye Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Eye Problems, Malaria, HIV/AIDS, Ulcers",
    "address": "Kumi Town, Kumi",
    "email": "info@kumihospital.go.ug",
    "phone": "+256 772 234567",
    "image": "https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 36,
    "name": "Busia General Hospital",
    "district": "Busia",
    "description": "General hospital serving Busia district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Dental Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Dental Problems, Malaria, HIV/AIDS, Tuberculosis, Ulcers",
    "address": "Busia Town, Busia",
    "email": "info@busiahospital.go.ug",
    "phone": "+256 772 345678",
    "image": "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 37,
    "name": "Iganga General Hospital",
    "district": "Iganga",
    "description": "Hospital offering medical and surgical services in Iganga district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Eye Care, Dental Services",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Eye Problems, Dental Issues, Malaria, HIV/AIDS, Ulcers",
    "address": "Iganga Town, Iganga",
    "email": "info@igangahospital.go.ug",
    "phone": "+256 772 456789",
    "image": "https://via.placeholder.com/600x300?text=Iganga+Hospital"
  },
  {
    "id": 38,
    "name": "Pallisa General Hospital",
    "district": "Pallisa",
    "description": "General hospital serving the Pallisa district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Physiotherapy",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Rehabilitation Services, Malaria, HIV/AIDS, Ulcers",
    "address": "Pallisa Town, Pallisa",
    "email": "info@pallisahospital.go.ug",
    "phone": "+256 772 567890",
    "image": "https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 39,
    "name": "Mayuge General Hospital",
    "district": "Mayuge",
    "description": "District hospital offering basic health services in Mayuge.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Nutrition",
    "conditions_treated": "General sickness, Long-term sickness, Infections, Small wounds, Health check-up, Outpatient care, Ulcers",
    "address": "Mayuge Town, Mayuge",
    "email": "info@mayugehospital.go.ug",
    "phone": "+256 772 678901",
    "image": "https://images.pexels.com/photos/4021814/pexels-photo-4021814.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 40,
    "name": "Kyenjojo General Hospital",
    "district": "Kyenjojo",
    "description": "Hospital providing general health care services to Kyenjojo district.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Dental Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Dental Problems, Malaria, HIV/AIDS",
    "address": "Kyenjojo Town, Kyenjojo",
    "email": "info@kyenjojohospital.go.ug",
    "phone": "+256 772 789012",
    "image": "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 41,
    "name": "Luwero General Hospital",
    "district": "Luwero",
    "description": "General hospital serving the Luwero district community.",
    "is_emergency": True,
    "has_ambulance": True,
    "has_pharmacy": True,
    "has_lab": True,
    "specialties": "General Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Internal Medicine, Emergency Medicine, Laboratory Services, Radiology, Dental Care",
    "conditions_treated": "General Medical Conditions, Surgical Cases, Maternal & Child Health, Infectious Diseases, Chronic Illnesses, Emergency Care, Diagnostic Services, Dental Problems, Malaria, HIV/AIDS",
    "address": "Luwero Town, Luwero",
    "email": "info@luwerohospital.go.ug",
    "phone": "+256 752 901234",
    "image": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
]


class Command(BaseCommand):
    help = 'Load initial hospital data'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        
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
            
            # Try to find existing hospital by name and address
            name = data['name']
            address = data['address']
            
            try:
                hospital = HealthCenter.objects.get(name=name, address=address)
                # Update existing hospital
                for key, value in data.items():
                    setattr(hospital, key, value)
                hospital.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated hospital: {name}'))
            except HealthCenter.DoesNotExist:
                # Create new hospital
                hospital = HealthCenter.objects.create(**data)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created hospital: {name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing {name}: {str(e)}'))

        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {len(HOSPITALS_DATA)} hospitals. '
                             f'Created: {created_count}, Updated: {updated_count}')
        )