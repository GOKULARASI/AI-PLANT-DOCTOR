import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Disease from './src/models/Disease.js';

dotenv.config();

const plantVillageDiseases = [
  {
    name: 'Tomato Early Blight (Alternaria solani)',
    description: 'A common fungal infection causing dark, concentric target-like rings on older lower leaves, eventually causing defoliation.',
    symptoms: [
      'Brown to black circular spots with concentric rings (target pattern)',
      'Yellow chlorotic halos surrounding leaf lesions',
      'Lower foliage dies and drops prematurely',
      'Sunscald on exposed tomato fruits'
    ],
    causes: [
      'Alternaria solani fungal pathogen',
      'Warm temperatures (24-29°C) combined with high humidity',
      'Rain splash transmitting spores from infected soil debris'
    ],
    severity: 'medium',
    affectedPlants: ['Tomato', 'Potato', 'Eggplant'],
    treatments: {
      organic: [
        'Apply Copper Fungicide or Bacillus subtilis spray every 7-10 days',
        'Neem oil foliar spray (5ml per liter of water) at first sign of spots'
      ],
      chemical: [
        'Chlorothalonil or Mancozeb protective fungicide',
        'Azoxystrobin systemic fungicide for advanced infections'
      ],
      homeRemedies: [
        'Baking soda spray (1 tbsp baking soda + 1 tsp horticultural soap in 1 gal water)',
        'Diluted raw milk spray (40% milk, 60% water) to build foliar immunity'
      ]
    },
    prevention: [
      'Mulch heavily around base of plants to prevent soil splash',
      'Prune bottom 12 inches of foliage for air circulation',
      'Rotate crops on a 3-year cycle away from nightshade family'
    ],
    recoveryTime: '2-3 weeks',
    images: ['https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Tomato Late Blight (Phytophthora infestans)',
    description: 'Devastating water mold causing large water-soaked olive-green to dark brown lesions with white fuzzy mold underneath in cool, wet weather.',
    symptoms: [
      'Irregular water-soaked greasy patches on leaves',
      'White fungal fuzz appearing under leaves during high humidity',
      'Rapid stem browning and entire plant collapse within days',
      'Firm, dark greasy rot on green and ripe fruits'
    ],
    causes: [
      'Phytophthora infestans oomycete',
      'Cool wet nights (15-20°C) with continuous moisture/fog',
      'Airborne sporangia carried on wind currents'
    ],
    severity: 'critical',
    affectedPlants: ['Tomato', 'Potato'],
    treatments: {
      organic: [
        'Liquid Copper Octanoate at first warning sign',
        'Bio-fungicide containing Trichoderma harzianum'
      ],
      chemical: [
        'Mandipropamid (Revus) or Cymoxanil spray',
        'Dimethomorph combined with protective Mancozeb'
      ],
      homeRemedies: [
        'Immediately rogue and bag diseased vines (do not compost)',
        'Ensure overhead plastic cover to prevent foliar wetness'
      ]
    },
    prevention: [
      'Plant certified blight-resistant tomato varieties (e.g., Defiant, Mountain Magic)',
      'Water only at the root zone using drip irrigation',
      'Destroy volunteer potatoes and cull piles before the season'
    ],
    recoveryTime: '3-4 weeks (if caught very early)',
    images: ['https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Tomato Septoria Leaf Spot',
    description: 'Destructive fungal leaf spot causing numerous small circular spots with grayish-white centers and dark brown margins.',
    symptoms: [
      'Numerous small (2-3mm) circular spots with grayish centers',
      'Tiny black specks (pycnidia) visible inside spot centers',
      'Lower leaves turn completely yellow and wither',
      'Progresses upward rapidly while fruit remains uninfected'
    ],
    causes: [
      'Septoria lycopersici fungus',
      'Overwintering fungal fruiting bodies in old crop residue',
      'Frequent rainfall and warm wet weather (20-25°C)'
    ],
    severity: 'high',
    affectedPlants: ['Tomato'],
    treatments: {
      organic: [
        'Bio-fungicide containing Serenade (Bacillus amyloliquefaciens)',
        'Copper sulfate pentahydrate spray'
      ],
      chemical: [
        'Chlorothalonil foliar application weekly during wet spells',
        'Difenoconazole or Pyraclostrobin'
      ],
      homeRemedies: [
        'Prune and discard all infected lower leaves promptly',
        'Chamomile tea infusion spray as mild organic antimicrobial'
      ]
    },
    prevention: [
      'Space plants 24-36 inches apart for optimal breeze',
      'Stake and cage tomatoes to keep foliage off ground',
      'Clean up and bury/burn all tomato debris in autumn'
    ],
    recoveryTime: '2 weeks',
    images: ['https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
    description: 'Severe viral disease transmitted by whiteflies leading to upward leaf cupping, severe stunting, and complete flower abortion.',
    symptoms: [
      'Upward curling and cupping of leaflet margins',
      'Pronounced yellowing (chlorosis) between leaf veins',
      'Severe plant stunting and bushy dwarf growth habit',
      'Flowers drop before setting fruit; zero yield on early infected plants'
    ],
    causes: [
      'Geminivirus transmitted exclusively by Bemisia tabaci whiteflies',
      'Infected transplants brought into greenhouse or field',
      'Hot dry weather that boosts whitefly populations'
    ],
    severity: 'critical',
    affectedPlants: ['Tomato', 'Pepper', 'Eggplant'],
    treatments: {
      organic: [
        'Cold-pressed Neem Oil (5ml/L) + Potassium soap to kill whitefly vectors',
        'Release predatory insects (Macrolophus or Encarsia wasps)'
      ],
      chemical: [
        'Imidacloprid or Acetamiprid systemic insecticide for whitefly control',
        'Pyriproxyfen insect growth regulator'
      ],
      homeRemedies: [
        'Yellow sticky cards placed at canopy height to trap whitefly vectors',
        'Uproot and securely bag infected plants immediately to prevent spread'
      ]
    },
    prevention: [
      'Use 50-mesh insect-proof netting in seedling nurseries',
      'Plant TYLCV-resistant hybrids (e.g., Tycoon, Camaro, Monica)',
      'Eradicate solanaceous weeds (nightshades) bordering gardens'
    ],
    recoveryTime: 'No cure once infected; manage vectors to protect new plants',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Powdery Mildew (Erysiphales)',
    description: 'Widespread fungal disease characterized by white talcum powder-like fungal growth on upper and lower leaf surfaces.',
    symptoms: [
      'White to dusty gray powdery patches covering leaves and stems',
      'Leaf twisting, distortion, and curled margins',
      'Yellowing foliage under powdery spots, followed by drying',
      'Premature leaf drop leading to poor fruit development'
    ],
    causes: [
      'Erysiphe and Podosphaera fungal species',
      'High humidity (over 70%) combined with dry leaves and low light/shade',
      'Crowded plantings with poor air movement'
    ],
    severity: 'medium',
    affectedPlants: ['Tomato', 'Cucumber', 'Zucchini', 'Grape', 'Rose', 'Apple', 'Pumpkin'],
    treatments: {
      organic: [
        'Potassium bicarbonate foliar spray (3g/L)',
        'Neem oil or horticultural oil spray every 7 days',
        'Sulfur-based dust or liquid fungicide'
      ],
      chemical: [
        'Myclobutanil or Tebuconazole fungicide',
        'Trifloxystrobin or Boscalid'
      ],
      homeRemedies: [
        'Milk spray: 1 part milk to 9 parts water sprayed in morning sunlight',
        'Baking soda solution (1 tsp baking soda + 1/2 tsp vegetable oil in 1L water)'
      ]
    },
    prevention: [
      'Plant in full sun (at least 6-8 hours daily)',
      'Prune center branches to encourage rapid air drying',
      'Avoid high nitrogen fertilizers that produce soft, succulent growth'
    ],
    recoveryTime: '1-2 weeks',
    images: ['https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Potato Late Blight',
    description: 'Catastrophic oomycete pathogen that caused the historical Irish Potato Famine, rotting both foliage and underground tubers.',
    symptoms: [
      'Irregular brown water-soaked blotches on leaves',
      'White ring of downy mold visible on underside of leaves',
      'Stem cankers turning dark purple/black',
      'Tubers develop dry, sunken brown/purplish granular rot under skin'
    ],
    causes: [
      'Phytophthora infestans',
      'Cool damp conditions (temperatures 10-21°C with persistent wetness)',
      'Carried over in infected seed tubers'
    ],
    severity: 'critical',
    affectedPlants: ['Potato', 'Tomato'],
    treatments: {
      organic: [
        'Fixed copper hydroxide application before rain events',
        'Cut and burn foliage 2 weeks prior to harvest if blight appears'
      ],
      chemical: [
        'Fluopicolide + Propamocarb (Infinito)',
        'Mancozeb or Chlorothalonil protectant sprays'
      ],
      homeRemedies: [
        'Hill potatoes high with soil to prevent rain washing spores onto tubers',
        'Never harvest tubers during wet soil conditions'
      ]
    },
    prevention: [
      'Plant certified disease-free seed tubers only',
      'Select resistant cultivars such as Sarpo Mira or Carolus',
      'Monitor weather blight alerts (Smith Periods)'
    ],
    recoveryTime: '3 weeks (foliar management)',
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Corn Common Rust (Puccinia sorghi)',
    description: 'Prominent fungal foliar disease producing golden-brown to cinnamon-red pustules on both upper and lower corn leaves.',
    symptoms: [
      'Small, circular to elongated golden-brown pustules on both leaf surfaces',
      'Pustules rupture epidermal tissue, releasing powdery cinnamon spores',
      'Extensive pustules coalesce, causing chlorosis and leaf death',
      'Pustules turn brownish-black late in season as teliospores form'
    ],
    causes: [
      'Puccinia sorghi fungus',
      'Airborne urediniospores blown northward on prevailing storm fronts',
      'Moderate temperatures (16-24°C) with high relative humidity and dew'
    ],
    severity: 'medium',
    affectedPlants: ['Corn (Maize)', 'Sweet Corn'],
    treatments: {
      organic: [
        'Apply sulfur dust or sulfur foliar spray',
        'Copper octanoate protective spray'
      ],
      chemical: [
        'Pyraclostrobin (Headline) or Azoxystrobin',
        'Propiconazole (Tilt) applied prior to tasseling stage'
      ],
      homeRemedies: [
        'Early morning inspection to isolate initial infected sweet corn stalks',
        'Avoid excessive overhead sprinkler irrigation'
      ]
    },
    prevention: [
      'Plant rust-resistant corn hybrid seeds',
      'Plant early in season to escape peak spore dispersal windows',
      'Maintain balanced soil potassium levels to increase stalk resistance'
    ],
    recoveryTime: '2-3 weeks',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Corn Northern Leaf Blight (Exserohilum turcicum)',
    description: 'Fungal leaf disease producing distinctive long, cigar-shaped grayish-green lesions that cause extensive canopy burn.',
    symptoms: [
      'Long (2-15 cm) elliptical, cigar-shaped grayish-green lesions',
      'Lesions turn tan and show dark olive fungal spore fuzz in humid weather',
      'Lower leaves affected first, progressing rapidly upward into the ear leaf',
      'Severe blight resembles drought or frost injury'
    ],
    causes: [
      'Exserohilum turcicum fungus',
      'Overwinters in corn residue left on the soil surface',
      'Wet weather with temperatures around 18-27°C and extended dew periods'
    ],
    severity: 'high',
    affectedPlants: ['Corn (Maize)', 'Sorghum'],
    treatments: {
      organic: [
        'Bio-fungicide sprays containing Bacillus subtilis',
        'Copper hydroxide liquid spray'
      ],
      chemical: [
        'Pyraclostrobin + Fluxapyroxad (Priaxor)',
        'Azoxystrobin + Difenoconazole'
      ],
      homeRemedies: [
        'Till crop residue under after harvest to accelerate microbial breakdown',
        'Stagger planting dates'
      ]
    },
    prevention: [
      'Use Northern Leaf Blight resistant hybrid corn seeds',
      'Rotate crops for at least 1-2 years with non-host legumes (soybean)',
      'Adopt minimum 30% residue burial via conservation tillage'
    ],
    recoveryTime: '3 weeks',
    images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Apple Scab (Venturia inaequalis)',
    description: 'The most economically significant apple disease worldwide, causing velvety olive-green spots on leaves and corky scabs on fruit.',
    symptoms: [
      'Dull olive-green velvety spots on leaves with feathered margins',
      'Leaves curl, turn yellow, and drop prematurely in mid-summer',
      'Fruit develops circular olive spots that turn into brown corky crusts',
      'Severely infected apples become cracked, misshapen, and stunted'
    ],
    causes: [
      'Venturia inaequalis ascomycete fungus',
      'Ascospores discharged from fallen overwintered leaves during spring rains',
      'Leaves remaining wet for 9 or more consecutive hours at 15-24°C'
    ],
    severity: 'high',
    affectedPlants: ['Apple', 'Crabapple', 'Pear'],
    treatments: {
      organic: [
        'Lime sulfur or wettable sulfur spray during green tip to petal fall',
        'Potassium bicarbonate foliar spray'
      ],
      chemical: [
        'Captan or Mancozeb protective sprays',
        'Flusilazole or Difenoconazole curative fungicides'
      ],
      homeRemedies: [
        'Rake and shred fallen apple leaves in autumn; spray with 5% urea solution',
        'Prune dense canopy to ensure sunlight reaches every fruit cluster'
      ]
    },
    prevention: [
      'Plant scab-immune apple varieties (e.g., Liberty, Enterprise, Freedom, Pristine)',
      'Keep grass cut short under orchard canopy to reduce ambient humidity',
      'Install drip irrigation rather than overhead sprinklers'
    ],
    recoveryTime: '3-4 weeks',
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Grape Black Rot (Guignardia bidwellii)',
    description: 'Destructive fungal grape disease turning juicy ripening berries into hard, shriveled black mummies covered in spore pustules.',
    symptoms: [
      'Small, circular reddish-brown leaf spots with black border dots',
      'Black elongated cankers on young green canes',
      'Berries develop light brown soft rot spots that rapidly enlarge',
      'Grapes shrivel within days into hard, wrinkled black mummies'
    ],
    causes: [
      'Guignardia bidwellii fungus',
      'Spore release from mummified berries left hanging on vines or on the ground',
      'Warm humid weather (21-27°C) requiring 6-7 hours of continuous leaf wetness'
    ],
    severity: 'critical',
    affectedPlants: ['Grape'],
    treatments: {
      organic: [
        'Bordeaux mixture (copper sulfate and slaked lime)',
        'Copper soap bio-fungicide applied every 10-14 days'
      ],
      chemical: [
        'Myclobutanil (Rally 40WSP) or Tebuconazole',
        'Mancozeb applied from 1-inch shoot growth until 4 weeks post-bloom'
      ],
      homeRemedies: [
        'Hand-pick and burn all shriveled grape mummies before winter pruning',
        'Canopy shoot positioning to maximize wind aeration'
      ]
    },
    prevention: [
      'Prune canes annually to ensure open trellis architecture',
      'Avoid planting vines in low frost pockets with sluggish air drainage',
      'Choose more resistant cultivars (e.g., Norton, Chancellor)'
    ],
    recoveryTime: '3 weeks',
    images: ['https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Pepper Bacterial Leaf Spot (Xanthomonas)',
    description: 'Devastating bacterial disease causing water-soaked spots that turn dark brown with yellow borders, leading to severe defoliation.',
    symptoms: [
      'Small (1-3mm) circular, water-soaked dark spots on lower leaf surface',
      'Spots turn necrotic brown with pale centers and chlorotic halos',
      'Leaves turn yellow, dry out, and drop off in large quantities',
      'Raised, wart-like brown scabs on bell and chili pepper fruits'
    ],
    causes: [
      'Xanthomonas campestris pv. vesicatoria bacteria',
      'Warm temperatures (24-30°C) with persistent rains and heavy dew',
      'Contaminated seed stocks and mechanical transmission on tools'
    ],
    severity: 'high',
    affectedPlants: ['Bell Pepper', 'Chili Pepper', 'Tomato'],
    treatments: {
      organic: [
        'Fixed copper sprays mixed with Mancozeb (synergistic bactericide)',
        'Bacillus subtilis strain QST 713 foliar bio-spray'
      ],
      chemical: [
        'Copper Hydroxide + Streptomycin (where permitted)',
        'Acibenzolar-S-methyl (Actigard) systemic acquired resistance inducer'
      ],
      homeRemedies: [
        'Disinfect garden clippers in 70% isopropyl alcohol between plants',
        'Avoid working in wet pepper patches to prevent bacterial spread'
      ]
    },
    prevention: [
      'Purchase certified hot-water treated pathogen-free pepper seeds',
      'Plant bacterial spot-resistant bell pepper hybrids (races 1-10)',
      'Rotate pepper beds away from nightshades for 2-3 years'
    ],
    recoveryTime: '2-3 weeks',
    images: ['https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80']
  },
  {
    name: 'Citrus Greening / Huanglongbing (HLB)',
    description: 'The world most destructive citrus infection, caused by phloem-limited bacteria spread by psyllids, causing bitter misshapen fruit.',
    symptoms: [
      'Asymmetric blotchy yellow mottle on mature citrus leaves',
      'Veins become enlarged, yellow, corky, and swollen',
      'Twigs die back, leading to sparse yellow canopy',
      'Fruit remains small, lopsided, stays green at the blossom end, and tastes bitter'
    ],
    causes: [
      'Candidatus Liberibacter asiaticus bacteria',
      'Vectored by Asian Citrus Psyllid (Diaphorina citri)',
      'Grafting with infected budwood'
    ],
    severity: 'critical',
    affectedPlants: ['Orange', 'Lemon', 'Lime', 'Grapefruit', 'Mandarin'],
    treatments: {
      organic: [
        'Nutritional foliar sprays (Zinc, Manganese, Boron) to sustain tree health',
        'Horticultural mineral oils and neem to suppress psyllid nymphs'
      ],
      chemical: [
        'Systemic Neonicotinoids (Imidacloprid) applied as soil drench',
        'Oxytetracycline trunk injections administered by certified arborists'
      ],
      homeRemedies: [
        'Release Tamarixia radiata parasitoid wasps as biological pest control',
        'Immediately identify and remove heavily declining trees to protect neighbors'
      ]
    },
    prevention: [
      'Purchase citrus trees exclusively from certified disease-free indoor nurseries',
      'Quarantine citrus budwood movements across agricultural boundaries',
      'Inspect young leaf flush weekly for psyllid eggs and nymphs'
    ],
    recoveryTime: 'Incurable chronic condition; focus on vector suppression and tree vitality',
    images: ['https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80']
  }
];

const seedDiseases = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to MongoDB. Seeding PlantVillage Disease Knowledge Base...');

    for (const d of plantVillageDiseases) {
      await Disease.findOneAndUpdate(
        { name: d.name },
        { $set: d },
        { upsert: true, new: true }
      );
      console.log(`  ✅ Synced: ${d.name}`);
    }

    const total = await Disease.countDocuments();
    console.log(`\n🎉 Disease Library seeding complete! Total diseases in database: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding diseases:', err);
    process.exit(1);
  }
};

seedDiseases();
