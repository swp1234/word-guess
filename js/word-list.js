/**
 * Word List for Word Guess Game
 * Answer words: curated common 5-letter English words
 * Guess validation: Free Dictionary API + local cache
 */

// Answer words: common, well-known 5-letter words for daily/practice puzzles
const ANSWER_WORDS = [
    // A
    'ABOUT','ABOVE','ABUSE','ACTOR','ACUTE','ADMIT','ADOPT','ADULT','AFTER','AGAIN',
    'AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT','ALIEN','ALIGN','ALIKE','ALIVE',
    'ALLEY','ALLOW','ALONE','ALONG','ALTER','AMAZE','AMBER','AMONG','AMPLE','ANGEL',
    'ANGER','ANGLE','ANGRY','ANKLE','ANNOY','APART','APPLE','APPLY','ARENA','ARGUE',
    'ARISE','ARMOR','AROMA','ARRAY','ARROW','ASIDE','ASSET','ATTIC','AUDIO','AUDIT',
    'AVOID','AWAKE','AWARD','AWARE',
    // B
    'BADGE','BADLY','BAKER','BASIC','BASIN','BASIS','BATCH','BEACH','BEARS','BEAST',
    'BEGAN','BEGIN','BEING','BELOW','BENCH','BERRY','BLACK','BLADE','BLAME','BLANK',
    'BLAST','BLAZE','BLEED','BLEND','BLESS','BLIND','BLINK','BLISS','BLOCK','BLOOD',
    'BLOOM','BLOWN','BLUES','BOARD','BOATS','BONES','BONUS','BOOKS','BOOST','BOOTH',
    'BOUND','BRAIN','BRAND','BRASS','BRAVE','BREAD','BREAK','BREED','BRICK','BRIDE',
    'BRIEF','BRING','BROAD','BROKE','BROOK','BROWN','BRUSH','BUILD','BUILT','BUNCH',
    'BURST','BUYER',
    // C
    'CABIN','CABLE','CAMEL','CANDY','CARDS','CARGO','CARRY','CATCH','CAUSE','CEASE',
    'CHAIN','CHAIR','CHALK','CHAMP','CHAOS','CHARM','CHART','CHASE','CHEAP','CHEAT',
    'CHECK','CHEEK','CHEER','CHESS','CHEST','CHIEF','CHILD','CHILL','CHINA','CHOIR',
    'CHOSE','CHUNK','CIVIC','CIVIL','CLAIM','CLASH','CLASS','CLEAN','CLEAR','CLERK',
    'CLICK','CLIFF','CLIMB','CLING','CLOCK','CLONE','CLOSE','CLOTH','CLOUD','CLOWN',
    'CLUBS','CLUES','COACH','COAST','CODES','COMET','COMIC','CORAL','COUNT','COUCH',
    'COULD','COURT','COVER','CRACK','CRAFT','CRANE','CRASH','CRAZE','CRAZY','CREAM',
    'CREEK','CREST','CRIME','CRISP','CROSS','CROWD','CROWN','CRUDE','CRUEL','CRUSH',
    'CURVE','CYCLE',
    // D
    'DAILY','DAIRY','DANCE','DEATH','DEALT','DEBUG','DECAY','DEMON','DENSE','DEPTH',
    'DERBY','DEVIL','DIARY','DIGIT','DIRTY','DODGE','DOUBT','DOUGH','DRAFT','DRAIN',
    'DRAMA','DRANK','DRAWN','DREAM','DRESS','DRIED','DRIFT','DRILL','DRINK','DRIVE',
    'DROPS','DROVE','DROWN','DRUNK','DWARF','DYING',
    // E
    'EAGER','EAGLE','EARLY','EARTH','EIGHT','ELBOW','ELDER','ELECT','ELITE','EMPTY',
    'ENEMY','ENJOY','ENTER','EQUAL','EQUIP','ERROR','EVENT','EVERY','EXACT','EXAMS',
    'EXIST','EXTRA',
    // F
    'FABLE','FAITH','FALSE','FANCY','FATAL','FAULT','FEAST','FENCE','FEWER','FIBER',
    'FIELD','FIFTH','FIFTY','FIGHT','FINAL','FIRST','FIXED','FLAME','FLASH','FLESH',
    'FLOAT','FLOOD','FLOOR','FLOUR','FLUID','FLUSH','FLUTE','FOCUS','FORCE','FORGE',
    'FORTY','FORUM','FOUND','FRAME','FRANK','FRAUD','FRESH','FRONT','FROST','FROZE',
    'FRUIT','FULLY','FUNDS','FUNNY','FUZZY',
    // G
    'GIANT','GIVEN','GLASS','GLEAM','GLOBE','GLOOM','GLORY','GLOSS','GLOVE','GOING',
    'GRACE','GRADE','GRAIN','GRAND','GRANT','GRAPE','GRAPH','GRASP','GRASS','GRAVE',
    'GRAVY','GREAT','GREED','GREEN','GREET','GRIEF','GRILL','GRIND','GROAN','GROSS',
    'GROUP','GROVE','GROWN','GUARD','GUESS','GUEST','GUIDE','GUILT','GUISE','GUMMY',
    // H
    'HABIT','HANDS','HAPPY','HARDY','HARSH','HASTE','HAUNT','HAVEN','HEADS','HEARD',
    'HEART','HEAVY','HELLO','HERBS','HERON','HINTS','HOBBY','HONEY','HONOR','HORSE',
    'HOTEL','HOURS','HOUSE','HOVER','HUMAN','HUMOR','HURRY',
    // I
    'IDEAL','IMAGE','IMPLY','INDEX','INDIE','INNER','INPUT','IRONY','ISSUE','IVORY',
    // J
    'JEWEL','JOINT','JOKER','JOLLY','JUDGE','JUICE','JUICY','JUMBO',
    // K
    'KAYAK','KNACK','KNEEL','KNIFE','KNOCK','KNOWN',
    // L
    'LABEL','LABOR','LANCE','LARGE','LASER','LATER','LAUGH','LAYER','LEADS','LEARN',
    'LEASE','LEAST','LEGAL','LEMON','LEVEL','LEVER','LIGHT','LIMIT','LINEN','LIVER',
    'LLAMA','LOCAL','LODGE','LOGIC','LOOSE','LORRY','LOVER','LOWER','LOYAL','LUCKY',
    'LUNAR','LUNCH','LYING',
    // M
    'MAGIC','MAJOR','MAKER','MANGA','MANOR','MAPLE','MARCH','MATCH','MAYOR','MEDIA',
    'MELON','MERCY','MERGE','MERIT','MERRY','METAL','METER','MIGHT','MINER','MINOR',
    'MINUS','MIRTH','MODEL','MONEY','MONTH','MORAL','MOTOR','MOUND','MOUNT','MOUSE',
    'MOUTH','MOVED','MOVIE','MUDDY','MUSIC','MOOSE',
    // N
    'NAIVE','NAKED','NASTY','NAVAL','NERVE','NEVER','NEWLY','NEXUS','NIGHT','NOBLE',
    'NOISE','NORTH','NOTED','NOVEL','NURSE',
    // O
    'OASIS','OCCUR','OCEAN','OFFER','OFTEN','OLIVE','ONSET','OPERA','ORBIT','ORDER',
    'OTHER','OUGHT','OUTER','OWNER','OXIDE',
    // P
    'PAINT','PANEL','PANIC','PAPER','PARTY','PASTA','PATCH','PAUSE','PEACE','PEACH',
    'PEARL','PENNY','PHASE','PHONE','PHOTO','PIANO','PIECE','PILOT','PINCH','PITCH',
    'PIXEL','PIZZA','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA','PLEAD','PLUCK',
    'PLUMB','PLUME','PLUMP','POINT','POLAR','POUND','POWER','PRESS','PRICE','PRIDE',
    'PRIME','PRINT','PRIOR','PRIZE','PROBE','PROOF','PROUD','PROVE','PROXY','PULSE',
    'PUNCH','PUPIL','PURSE',
    // Q
    'QUACK','QUEEN','QUERY','QUEST','QUEUE','QUICK','QUIET','QUILT','QUIRK','QUITE',
    'QUOTA','QUOTE',
    // R
    'RADAR','RADIO','RAISE','RALLY','RANCH','RANGE','RAPID','RATIO','REACH','REACT',
    'READY','REALM','REBEL','REIGN','RELAX','RELAY','RENAL','RENEW','REPLY','RIDER',
    'RIDGE','RIFLE','RIGHT','RIGID','RISEN','RISKY','RIVAL','RIVER','ROBIN','ROBOT',
    'ROCKY','ROGER','ROUGE','ROUGH','ROUND','ROUTE','ROYAL','RUGBY','RULER','RURAL',
    // S
    'SADLY','SAINT','SALAD','SAUCE','SCALE','SCARE','SCARY','SCENE','SCENT','SCORE',
    'SCOUT','SCRAP','SEIZE','SENSE','SERVE','SEVEN','SHADE','SHALL','SHAME','SHAPE',
    'SHARE','SHARK','SHARP','SHAVE','SHEEP','SHEER','SHEET','SHELF','SHELL','SHIFT',
    'SHINE','SHIRT','SHOCK','SHOOT','SHORE','SHORT','SHOUT','SHOWN','SIGHT','SILLY',
    'SINCE','SIXTH','SIXTY','SKILL','SKULL','SLASH','SLATE','SLEEP','SLICE','SLIDE',
    'SLOPE','SMART','SMELL','SMILE','SMOKE','SNAKE','SOLAR','SOLID','SOLVE','SORRY',
    'SOUTH','SPACE','SPARE','SPARK','SPEAK','SPEED','SPELL','SPEND','SPENT','SPICE',
    'SPIKE','SPINE','SPLIT','SPOKE','SPOON','SPORT','SPRAY','SQUAD','STAGE','STAIN',
    'STAKE','STALE','STALK','STALL','STAMP','STAND','STARE','START','STATE','STEAK',
    'STEAL','STEAM','STEEL','STEEP','STEER','STERN','STICK','STIFF','STILL','STOCK',
    'STOLE','STONE','STOOD','STOOL','STORE','STORM','STORY','STOVE','STUCK','STUDY',
    'STUFF','STUMP','STUNG','STYLE','SUGAR','SUITE','SUNNY','SUPER','SURGE','SWAMP',
    'SWEAR','SWEAT','SWEEP','SWEET','SWEPT','SWIFT','SWING','SWORD','SWORE','SWORN',
    // T
    'TABLE','TASTE','TEACH','TEETH','TEMPO','TENSE','TENTH','TERMS','THEFT','THEME',
    'THERE','THICK','THIEF','THING','THINK','THIRD','THORN','THOSE','THREE','THREW',
    'THROW','THUMB','TIGER','TIGHT','TIMER','TIRED','TITLE','TODAY','TOKEN','TOTAL',
    'TOUCH','TOUGH','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL','TRAIN','TRAIT',
    'TRASH','TREAT','TREND','TRIAL','TRIBE','TRICK','TRIED','TROOP','TRUCK','TRULY',
    'TRUMP','TRUNK','TRUST','TRUTH','TUMOR','TUNER','TURNS','TWICE','TWIST',
    // U
    'ULTRA','UNCLE','UNDER','UNION','UNITE','UNITY','UNTIL','UPPER','UPSET','URBAN',
    'USAGE','USUAL','UTTER',
    // V
    'VAGUE','VALID','VALUE','VALVE','VAULT','VIDEO','VIGOR','VINYL','VIRAL','VIRUS',
    'VISIT','VITAL','VIVID','VOCAL','VODKA','VOICE','VOTER',
    // W
    'WAGES','WAGON','WAIST','WASTE','WATCH','WATER','WAVES','WEARY','WEAVE','WEDGE',
    'WEIRD','WHALE','WHEAT','WHEEL','WHERE','WHICH','WHILE','WHITE','WHOLE','WHOSE',
    'WIDER','WIDTH','WITCH','WOMAN','WOMEN','WOODS','WORLD','WORRY','WORSE','WORST',
    'WORTH','WOULD','WOUND','WRATH','WRITE','WRONG','WROTE',
    // Y
    'YACHT','YIELD','YOUNG','YOUTH',
    // Z
    'ZEBRA','ZESTY'
];

// Local cache for API-validated words (valid = true, invalid = false)
const _wordCache = {};
// Pre-populate cache with all answer words
ANSWER_WORDS.forEach(w => { _wordCache[w] = true; });

// Validate word via Free Dictionary API
async function _checkDictionaryAPI(word) {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return res.ok;
    } catch {
        // Network error: accept the word to avoid blocking gameplay
        return true;
    }
}

// Async word validation: checks cache first, then API
async function isValidWordAsync(word) {
    const upper = word.toUpperCase();
    if (upper.length !== 5) return false;

    // Check cache
    if (_wordCache[upper] !== undefined) {
        return _wordCache[upper];
    }

    // Check API
    const valid = await _checkDictionaryAPI(upper);
    _wordCache[upper] = valid;
    return valid;
}

// Sync fallback (for backward compatibility) - checks cache only
function isValidWord(word) {
    const upper = word.toUpperCase();
    if (upper.length !== 5) return false;
    // Cache hit
    if (_wordCache[upper] !== undefined) return _wordCache[upper];
    // Not in cache = unknown, accept optimistically (API will validate later)
    return true;
}

// Get word of the day based on date
function getWordOfTheDay() {
    const today = new Date();
    const startDate = new Date(2024, 0, 1);
    const dayIndex = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) % ANSWER_WORDS.length;
    return ANSWER_WORDS[dayIndex];
}

// Get a random word for practice mode
function getRandomWord() {
    return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)];
}
