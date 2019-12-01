let {
    choose,
    chooseAndRemove,
    combine,
    reduce,
    paragraph,
    youngAdultAge,
    middleAge,
    whole_number,
    floating_point_number,
    bool,
} = require("./randomtext");

var pl = require( "./pl/core.js" );

const firstNameStart = [
    "Ar",
    "At",
    "Ben",
    "Dar",
    "Don",
    "Ed",
    "Fa",
    "Fo",
    "Ja",
    "Jaa",
    "Jo",
    "Ju",
    "Ma",
    "Mar",
    "Na",
    "Nu",
    "Po",
    "Ro",
    "Ra",
    "Sa",
    "Sen",
    "Son",
    "To",
    "Va",
    "Vo",
];

const firstNameEnd = [
    "an",
    "ang",
    "ara",
    "aro",
    "cus",
    "dan",
    "dang",
    "den",
    "don",
    "du",
    "ne",
    "no",
    "on",
    "ong",
    "ra",
    "rah",
    "ren",
    "ro",
    "row",
    "se",
    "sen",
    "sh",
    "sha",
    "shen",
    "shon",
    "ta",
    "tan",
    "tash",
    "ten",
    "to",
    "ton",
    "tu",
    "va",
    "ve",
];

const nameSeparators = [
    "",
    "",
    "",
    //"'",
    "-",
];

function firstName() {
    return choose(firstNameStart) + choose(nameSeparators) + choose(firstNameEnd);
}

const lastNameStart = [
    "Abe",
    "Art",
    "Ast",
    "Bea",
    "Bel",
    "Bor",
    "Bul",
    "Cal",
    "Dre",
    "Ero",
    "Fra",
    "Fer",
    "For",
    "Gor",
    "Ger",
    "Gin",
    "Hue",
    "Han",
    "Jun",
    "Jon",
    "Jar",
    "Per",
    "Por",
    "Pos",
    "Sor",
    "Tu",
    "Tor",
    "Ver",
    "We",
    "Wo",
];

const lastNameEnd = [
    "cy",
    "bas",
    "fen",
    "lon",
    "len",
    "men",
    "na",
    "ron",
    "ra",
    "ron",
    "sa",
    "sen",
    "son",
    "sun",
    "ta",
    "te",
    "tte",
    "to",
    "wen",
    "wei",
];

function lastName() {
    return choose(lastNameStart) + choose(lastNameEnd);
}

const profession = [
    "engineer",
    "professor",
    "student",
    "musician",
    "artist",
    "chemist",
    "pharmacist",
    "farmer",
    "butcher",
    "filmmaker",
    "futurist",
    "writer",
    "reporter",
    "journalist",
    "news anchor",
];

function upperCaseWord(s) {
    return s[0].toUpperCase() + s.slice(1);
}

const gender = [
    "male",
    "female",
    "non-binary",
];

function pronouns(gender) {
    switch (gender) {
    case "male":
        return ["he", "him", "his", "himself"];
    case "female":
        return ["she", "her", "her", "herself"];
    case "non-binary":
        return ["they", "them", "their", "themself"];
    default:
        throw "unexpected gender " + gender;
    }
}

function conjugate(character, verb) {
    switch (character.pronouns.direct) {
    case "he":
    case "she":
        return verb;
    case "they":
        if (verb == "is") {
            return "are";
        } else if (verb.endsWith('s')) {
            return verb.slice(0, verb.length - 1);
        }
        return verb;
    default:
        throw "unexpected pronoun " + character.pronouns.direct;
    }
}

function modifyRelationship(char1, char2, name, affection) {
    allCharacters[char1].relationships[char2] = {
        name: name,
        value: affection,
    };
}

function symmetricRelationship(name, char1, affection1, char2, affection2) {
    modifyRelationship(char1, char2, name, affection1);
    modifyRelationship(char2, char1, name, affection2);
}

function asymmetricRelationship(name1, char1, affection1, name2, char2, affection2) {
    modifyRelationship(char1, char2, name1, affection1);
    modifyRelationship(char2, char1, name2, affection2);
}

function toAtom(s) {
    if (typeof s != "string") {
        return s;
    }
    return s
        .toLowerCase()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("'", "_")
    ;
}

let allCharacters = [];
function Character(firstName, lastName, profession, age, gender, emotion) {
    let [direct, indirect, possessive, reflexive] = pronouns(gender);

    this.firstName = firstName;
    this.lastName = lastName;
    this.profession = profession;
    this.age = age;
    this.gender = gender;
    this.emotion = emotion;
    this.relationships = {};
    this.pronouns = {
        direct: direct,
        indirect: indirect,
        possessive: possessive,
        reflexive: reflexive,
    };
    this.id = allCharacters.length;
    this.knowledge = pl.create();

    this.record("feels", [this.firstName, this.emotion]);
    this.record("age", [this.firstName, this.age]);
    this.record("profession", [this.firstName, this.profession]);

    for (const o of indoorObject.concat(outdoorObject)) {
        if (bool()) {
            //console.log(this.firstName + " " + s);
            this.record("like", [o]);
        }
    }
    allCharacters.push(this);
}

Character.prototype.record = function(name, args) {
    let allArgs = args.map((a) => toAtom(a)).join(",");
    let s = name + "(" + allArgs + ").";
    if (!this.knowledge.consult(s)) {
        console.error("bad knowledge: " + s);
    }
}

Character.prototype.adjustRelationshipWith = function(id, modifier) {
    if (!(id in this.relationships)) {
        this.relationships[id] = { value: 0.5 };
    }
    this.relationships[id].value *= modifier;
}

Character.prototype.likesObject = async function(o) {
    //console.log(this.firstName + ' checking like(' + toAtom(o) + ')');
    return new Promise((resolve, reject) => {
        if (!this.knowledge.query("like(" + toAtom(o) + ").")) {
            console.error('bad likeobject query');
            return resolve(false);
        }
        this.knowledge.answer((a) => {
            //console.log('got likeObject answer: ' + a);
            if (typeof a != "boolean" && !pl.type.is_substitution(a)) {
                console.error('bad likeobject response', a);
                reject(a);
            }
            resolve(pl.type.is_substitution(a));
        });
    });
}

Character.prototype.knowsAnyFactAbout = function(factName, actor) {
    return new Promise((resolve, reject) => {
        let q = factName + "(" + toAtom(allCharacters[actor].firstName) + ", X).";
        if (!this.knowledge.query(q)) {
            console.error("bad query for " + q);
            return resolve(false);
        }
        this.knowledge.answer((a) => {
            //console.log(q, a);
            resolve(pl.type.is_substitution(a))
        });
    });
}

Character.prototype.knowsSpecificFactAbout = function(factName, actor, value) {
    //console.log(this.firstName + ' checking ' + factName + "(" + toAtom(allCharacters[actor].firstName) + ", " + toAtom(value) + ")");
    return new Promise((resolve, reject) => {
        if (!this.knowledge.query(factName + "(" + toAtom(allCharacters[actor].firstName) + ", " + toAtom(value) + ").")) {
            console.error('bad query for ' + factName);
            return resolve(false);
        }
        this.knowledge.answer((a) => {
            //console.log('got answer: ' + a);
            if (typeof a != "boolean" && !pl.type.is_substitution(a)) {
                console.error('bad answer for ' + factName, a);
                reject(a);
            }
            resolve(pl.type.is_substitution(a));
        });
    });
}

Character.prototype.knows = function(id) {
    return id in this.relationships;
}

Character.prototype.likes = function(id) {
    return this.knows(id) && this.relationships[id].value >= 0.5;
}

Character.prototype.dislikes = function(id) {
    return this.knows(id) && this.relationships[id].value < 0.5;
}

Character.prototype.recordFact = function(factName, actor, value) {
    //console.log(this.firstName + ' recording ' + s);
    this.record(factName, [allCharacters[actor].firstName, value]);
}

function character(age) {
    let charGender = choose(gender);
    return new Character(
        firstName(), lastName(),
        choose(profession),
        age,
        choose(gender),
        choose(positiveEmotions.concat(negativeEmotions))
    ).id;
}

function genderedRelationship(char1, char2) {
    let genders = {
        "male": 0,
        "female": 1,
        "non-binary": null,
    };
    let kinds = {
        "parent": ["father", "mother"],
        "child": ["son", "daughter"],
        "spouse": ["husband", "wife"],
        "sibling": ["brother", "sister"],
    };
    let relationships = allCharacters[char1].relationships;
    if (char2 in relationships) {
        let gender = genders[allCharacters[char2].gender];
        let name = relationships[char2].name;
        if (name in kinds && gender != null) {
            return kinds[name][gender];
        } else {
            return name;
        }
    } else {
        return "stranger";
    }
}

function Family() {
    this.members = [];
    this.parents = [];
    this.children = [];
}

Family.prototype.addParent = function() {
    let actor = character(middleAge());
    for (const spouse of this.parents) {
        symmetricRelationship("spouse", actor, floating_point_number(0.0, 1.0), spouse, floating_point_number(0.0, 1.0));
    }
    for (const child of this.children) {
        asymmetricRelationship("child", actor, floating_point_number(0.0, 1.0), "parent", child, floating_point_number(0.0, 1.0));
    }
    this.parents.push(actor);
    this.members.push(actor);
}

Family.prototype.addChild = function() {
    let actor = character(youngAdultAge());
    for (const parent of this.parents) {
        asymmetricRelationship("child", parent, floating_point_number(0.0, 1.0), "parent", actor, floating_point_number(0.0, 1.0));
    }
    for (const sibling of this.children) {
        symmetricRelationship("sibling", actor, floating_point_number(0.0, 1.0), sibling, floating_point_number(0.0, 1.0));
    }
    this.children.push(actor);
    this.members.push(actor);
}

function createFamily() {
    let numParents = 0, numChildren = 0;
    while (numParents + numChildren < 2) {
        numParents = whole_number(0, 4);
        numChildren = whole_number(0, 4);
    }

    let family = new Family();
    for (var i = 0; i < numParents; i++) {
        family.addParent();
    }
    for (var i = 0; i < numChildren; i++) {
        family.addChild();
    }

    return family;
}

let positiveEmotions = [
    "happy",
    "amorous",
    "excited",
    "delighted",
    "rapturous",
    "content",
    "thoughtful",
    "relaxed",
    "warm",
    "pensive",
    "triumphant",
    "contemplative",
    "introspective",
    "solemn",
    "wistful",
    "tender",
    "attentive",
    "confident",
];

let negativeEmotions = [
    "sad",
    "disgruntled",
    "distraught",
    "bored",
    "tired",
    "frustrated",
    "upset",
    //"lonely",
    "nervous",
    "suspicious",
    "glum",
    "angry",
    "fearful",
    "tense",
    "jealous",
    "dejected",
    "disappointed",
    "heavy-hearted",
    "despondent",
    "dour",
    "woeful",
    "anxious",
    "hysterical",
    "frightened",
];

function describeCharacter(char) {
    let parts = [
        [
            char.firstName,
            char.lastName,
            "is a",
            char.age,
            "year old",
            char.gender,
            char.profession,
            ".",
        ],
        [
            char.pronouns.direct,
            conjugate(char, "feels"),
            char.emotion,
            ".",
        ],
    ];
    for (var r in char.relationships) {
        parts.push([
            char.pronouns.possessive,
            genderedRelationship(char.id, r),
            "is named",
            allCharacters[r].firstName,
            ".",
        ]);
    }
    return paragraph(parts);
}

const indoorObject = [
    "sofa",
    "chair",
    "table",
    "lamp",
    "small plant",
    "picture",
];

const indoorEnvironments = [
    "bedroom",
    "kitchen",
    "living room",
    "hall",
    "classroom",
    "room",
    "cafeteria",
    "shop",
];

const outdoorObject = [
    "tree",
    "bush",
    "grass",
    "leaf",
    "spider web",
    "flower",
];

const outdoorEnvironments = [
    "backyard",
    "garden",
    "park",
    "field",
    "forest",
    "street",
];

function State() {
    this.lookingAt = null;
    this.eyes = "open";
    this.holding = null;
}

function Setting(environment, objects, isIndoors) {
    this.environment = environment;
    this.characters = [];
    this.characterStates = {};
    this.objects = objects;
    this.isIndoors = isIndoors;
}

Setting.prototype.isPresent = function(character) {
    return this.characters.indexOf(character) != -1;
}

Setting.prototype.addCharacter = function(character) {
    this.characters.push(character);
    this.characterStates[character] = new State();
}

Setting.prototype.removeCharacter = function(character) {
    this.characters.splice(this.characters.indexOf(character), 1);
    delete this.characterStates[character];
}

Setting.prototype.resetCharacters = function() {
    this.characterStates = {};
    this.characters = []

    let minCharacters = Math.min(1, allCharacters.length);
    let maxCharacters = Math.min(4, allCharacters.length);
    let numCharacters = whole_number(minCharacters, maxCharacters);
    while (this.characters.length < numCharacters) {
        let char = whole_number(0, allCharacters.length);
        if (this.characters.indexOf(char) == -1) {
            this.addCharacter(char);
        }
    }
}

function createSetting() {
    const isIndoors = bool();
    const environment = isIndoors ? choose(indoorEnvironments) : choose(outdoorEnvironments);
    const objectSource = isIndoors ? indoorObject : outdoorObject;

    let numObjects = whole_number(1, objectSource.length);
    let objects = [];
    for (var i = 0; i < numObjects; i++) {
        let o = choose(objectSource);
        if (objects.indexOf(o) != -1) {
            i--;
            continue;
        }
        objects.push(o);
    }

    let setting = new Setting(environment, objects, isIndoors);
    setting.resetCharacters();

    return setting;
}

function describeSetting(setting) {
    const chars = setting.characters.map(c => allCharacters[c].firstName);
    const verb = chars.length > 1 ? "are" : "is";

    let result = [];
    for (const c of chars) {
        result.push(c);
        result.push("and");
    }
    // remove last "and"
    result.pop();

    /*const actions = [
        "sitting",
        "standing",
        "lying",
        "talking",
        "walking",
        "running",
    ];*/

    const rest = [
        verb,
        //choose(actions),
        "in",
        "a",
        setting.environment,
        ".",
    ];
    for (const r of rest) {
        result.push(r);
    }

    let result2 = [
        "there",
        "is",
    ];
    for (const o of setting.objects) {
        result2.push("a");
        result2.push(o);
        result2.push("and");
    }
    // remove last "and"
    result2.pop();
    result2.push(".");

    return paragraph([result, setting.objects.length ? result2 : []]);
}

async function exactAction(text, state) {
    const actions = new Actions([
        new Action(text, () => true, state)
    ], {});
    let action = await chooseAction(actions);
    let properties = {};
    return evaluateAction(action, properties, function() {
        return this.text;
    });
}

async function yesNoResponse(actor) {
    const actions = new Actions([
        new Action(
            [
                "Absolutely",
                "Yes",
                "Yes, of course",
                "For sure",
                "Undoubtedly",
                "You bet",
                "Unquestionably",
                "Of course",
                "Probably",
                "Maybe",
                "Most likely",
                "Most likely, yes",
                "I have no doubt",
                "I believe so",
                "I think so",
            ],
        ),

        new Action(
            [
                "Absolutely not",
                "No",
                "Nope",
                "Not at all",
                "I guess not",
                "Definitely not",
                "Maybe not",
                "Probably not",
                "Possibly not",
                "I don't think so",
                "Of course not",
                "No way",
            ],
        ),
    ], {});

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' responds' + (bool() ? ' ' + adverb(this.actor.emotion) : "") + ".";
        return baseText;
    });
}

function adverb(emotion) {
    let exceptions = {
        "happy": "happily",
        "content": "contentedly",
        "angry": "angrily",
    };
    if (emotion in exceptions) {
        return exceptions[emotion];
    }
    return emotion + "ly";
}

async function respondToOffer(scene, actor, offeree, accept, decline) {
    const actions = new Actions([
        new Action(
            [
                "Ok",
                "Sure",
                "Yes",
                "Alright",
                "Yep",
            ],
            // If there's a relationship, positive response is proportional to how likable.
            ({actor, target}) => !allCharacters[actor].knows(target) || floating_point_number(0.0, 1.0) < allCharacters[actor].relationships[target].value,
            ({scene, actor, target}) => scene.pending.push(accept),
        ),

        new Action(
            [
                "No",
                "No way",
                "Sorry, no",
                "Nuh-uh",
                "Nope",
            ],
            // If there's a relationship, negative response is inversely proportional to how likable.
            ({actor, target}) => !allCharacters[actor].knows(target) || floating_point_number(0.0, 1.0) > allCharacters[actor].relationships[target].value,
            ({scene, actor, target}) => scene.pending.push(decline),
        ),
    ], {
        scene: scene,
        actor: actor,
        target: offeree,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' replies.';
        return baseText;
    });
}

async function replyToQuestion(scene, actor, target) {
    const actions = new Actions([
        new Action(
            [
                "I'm feeling {{emotion}}",
                "I feel {{emotion}}",
                "I'm {{emotion}}; thanks for asking",
                "Today's been a real {{emotion}} day",
                "Right now? I'm pretty {{emotion}}",
                "I can't shake this {{emotion}} feeling",
                "I guess I'd have to say I'm {{emotion}}",
                "You could say I'm {{emotion}}",
                "Mostly {{emotion}}, I guess",
            ],
            ({actor, target}) => allCharacters[actor].likes(target),
            ({scene, actor}) => scene.recordFact('feels', actor, allCharacters[actor].emotion),
        ),

        new Action(
            [
                "You don't actually care",
                "You're just pretending to care",
                "Don't ask me that if you don't care",
                "Don't talk to me",
                "I don't want to answer that",
                "I'm not going to answer that",
                "You don't get to ask me that",
                "Stop pretending to care about me",
                "Stop. Just stop",
            ],
            ({actor, target}) => allCharacters[actor].dislikes(target),
        ),

        new Action(
            [
                "We don't know each other",
                "I'd prefer not to answer that",
                "That's a very personal question",
                "I would rather not answer that",
                "I don't do small talk",
                "Dunno",
                "I don't know",
                "Hard to say",
                "Eh",
                "Whatever",
            ],
            ({actor, target}) => !allCharacters[actor].knows(target),
        ),
    ], {
        'actor': actor,
        'target': target,
        'scene': scene,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' replies.';
        baseText = baseText
            .replace("{{emotion}}", this.actor.emotion)
        ;
        return baseText;
    });
}

async function askQuestion(scene, selections = {}) {
    const actor = 'actor' in selections ? selections.actor : choose(scene.setting.characters);
    // Can't have dialogue without any characters present.
    if (!actor) {
        return null;
    }

    const target = 'target' in selections ? selections.target : choose(scene.setting.characters.filter((c) => c != actor));
    if (!target) {
        return null;
    }

    const other = choose(scene.setting.characters.filter(c => c != actor && c != target));

    const actions = new Actions([
        new Action(
            [
                "How are you",
                "How are you doing",
                "How is it going",
                "How are things",
                "How're you",
                "How're you doing",
                "How's it going",
            ],
            () => true,
            ({scene, actor, target}) => scene.pending.push(replyToQuestion.bind(null, scene, target, actor)),
        ),

        new Action(
            [
                "Aren't you a little old to be a {{job}}",
                "Aren't you a bit young to be a {{job}}",
            ],
            async ({actor, target}) => {
                return (await allCharacters[actor].knowsAnyFactAbout('profession', target)) &&
                    (await allCharacters[actor].knowsAnyFactAbout('age', target));
            },
            ({actor, target}) => {
                if (allCharacters[target].knows(actor)) {
                    allCharacters[target].adjustRelationshipWith(actor, 0.6);
                }
            }
        ),

        new Action(
            [
                "Do you know {{thirdParty}}",
                "Have you met {{thirdParty}}",
                "May I introduce {{thirdParty}}",
            ],
            ({actor, other}) => other != null && allCharacters[actor].knows(other),
            ({actor, target, other, scene}) => {
                if (allCharacters[target].knows(other)) {
                    scene.pending.push(exactAction.bind(null, "\"Yes, we've met,\" " + allCharacters[target].firstName + " replies.", () => {}));
                } else {
                    allCharacters[target].relationships[other] = { value: 0.5 };
                    scene.pending.push(exactAction.bind(null, "\"Nice to meet you " + allCharacters[other].firstName +",\" " + allCharacters[target].firstName + " says.", () => {}));
                    scene.pending.push(introduceSelf.bind(null, scene, target, false));
                }
            }
        ),

        new Action(
            [
                "Have you ever been in love",
                "Do you believe in soulmates",
                "Is there an afterlife",
                "Is the universe infinite",
                "Do you think people are inherently good",
                "Is there such a thing as universal morality",
                "Have you ever read something that fundamentally changed your worldview",
                "Would you try to rescue me if my life were in danger",
                "Does your life satisfy you",
                "Is there a purpose to staying alive",
                "Do you have any regrets",
                "Have you found meaning in your life",
                "Are there aliens out there in the universe",
                "Do the ends justify the means",
                "Is there a cause you would die for",
                "Have you ever done something unforgivable",
                "Is anything truly unbiased",
                "Are you proud of your life",
                "Do you have a reason to wake up every day",
            ],
            () => true,
            ({target, scene}) => scene.pending.push(yesNoResponse.bind(null, target)),
        ),
    ], {
        'scene': scene,
        'actor': actor,
        'target': target,
        'other': other,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': allCharacters[target],
        'other': other != null ? allCharacters[other] : null,
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '?" ' + this.actor.firstName + ' asks ' + this.target.firstName + '.';
        baseText = baseText.replace("{{job}}", this.target.profession);
        if (this.other) {
            baseText = baseText.replace('{{thirdParty}}', this.other.firstName);
        }
        return baseText
        ;
    });
}

async function performInnerDialogue(scene) {
    let actor = scene.povCharacter;

    const target = choose(scene.setting.characters.filter((c) => c != actor));

    const actions = new Actions([
        new Action(
            [
                "I wonder why {{targetName}} is so {{targetEmotion}}",
                "{{targetName}} seems {{targetEmotion}} today",
                "{{targetName}} seems more {{targetEmotion}} than usual",
                "{{targetName}} seems to be particularly {{targetEmotion}}",
                "I'm getting strong {{targetEmotion}} vibes from {{targetName}}",
                "I wonder what made {{targetName}} so {{targetEmotion}}",
                "I hope I didn't make {{targetName}} {{targetEmotion}}",
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsSpecificFactAbout('feels', target, allCharacters[target].emotion),
        ),

        new Action(
            [
                "Oh no, not {{targetName}} again",
                "{{targetName}} is the worst",
                "I wish {{targetName}} would leave",
                "{{targetName}} shouldn't be here",
                "I don't like being around {{targetName}}",
                "Maybe {{targetName}} will leave soon",
                "I hope {{targetName}} doesn't stay long",
            ],
            ({actor, target}) => target != null && allCharacters[actor].dislikes(target),
        ),

        new Action(
            [
                "{{targetName}} is great",
                "I like {{targetName}}",
                "I hope {{targetName}} likes me",
                "I like spending time with {{targetName}}",
                "I wonder if {{targetName}} and I are friends",
                "I'm glad {{targetName}} is here",
                "I hope {{targetName}} will stay for a while",
                "I want to get to know {{targetName}} better",
            ],
            ({target}) => target != null && allCharacters[actor].likes(target),
        ),

        new Action(
            [
                "I wish I was a {{targetProfession}} like {{targetName}}",
                "I don't know if I could be a {{targetProfession}} like {{targetName}}",
                "Being a {{targetProfession}} like {{targetName}} sounds hard",
                "{{targetName}} make being a {{targetProfession}} look easy",
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsAnyFactAbout('profession', target),
        ),

        new Action(
            [
                "I bet {{targetName}} is a great {{targetProfession}}",
                "{{targetName}} must be a good {{targetProfession}}",
                "I'm sure {{targetName}} is a talented {{targetProfession}}",
            ],
            async ({actor, target}) => target != null && (await allCharacters[actor].knowsAnyFactAbout('profession', target)) && allCharacters[actor].likes(target),
        ),

        new Action(
            [
                "I bet {{targetName}} is a terrible {{targetProfession}}",
                "{{targetName}} can't be that good a {{targetProfession}}",
                "I'm surprised {{targetName}} ever became a {{targetProfession}}",
            ],
            async ({actor, target}) => target != null && (await allCharacters[actor].knowsAnyFactAbout('profession', target)) && allCharacters[actor].dislikes(target),
        ),
    ], {
        target: target,
        actor: actor,
    });

    let action = await chooseAction(actions);
    let properties = {
        actor: allCharacters[actor],
        target: target != null ? allCharacters[target] : null,
        scene: scene,
    };
    return evaluateAction(action, properties, function() {
        let baseText = "'" + this.text + ",' " + this.actor.firstName + " thinks" + (bool() ? " to {{pronoun}}" : "") + ".";
        baseText = baseText.replace("{{pronoun}}", this.actor.pronouns.reflexive);
        if (this.target != null) {
            baseText = baseText
                .replace("{{targetEmotion}}", this.target.emotion)
                .replace("{{targetName}}", this.target.firstName)
                .replace("{{targetProfession}}", this.target.profession)
            ;
        }
        return baseText;
    });
}

async function performDialogue(scene) {
    const actor = choose(scene.setting.characters);
    // Can't have dialogue without any characters present.
    if (!actor) {
        return null;
    }

    const target = choose(scene.setting.characters.filter((c) => c != actor));
    const object = choose(scene.setting.objects);

    const actions = new Actions([
        new Action(
            [
                "I feel {{emotion}}",
                "This {{environment}} makes me feel {{emotion}}",
                "I feel like I've been {{emotion}} for days now",
                "I sure wish I could stop being so {{emotion}}",
                "This has been a very {{emotion}} day",
                "It's not easy being so {{emotion}}",
                "It would be nice if more people were {{emotion}} like me",
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('feels', actor, allCharacters[actor].emotion),
        ),

        new Action(
            [
                "I am {{age}} but I feel {{randomAge}}",
                "It's not easy being {{age}}",
                "I'm living my best life as a {{age}} year old",
                "I tell myself that being {{age}} is no different than {{randomAge}}",
                "{{age}} is a mind-trip",
                "I would take being {{age}} over being {{randomAge}} any day",
                "I used to fear reaching {{age}}",
                "I can't win; {{randomAge}} is the new {{age}}",
                "I think my life didn't truly begin until {{age}}",
                "People ask me if they should worry about turning {{age}}, and I don't know what to tell them",
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('age', actor, allCharacters[actor].age),
        ),

        new Action(
            [
                "You look {{targetEmotion}}",
                "You look like you are {{targetEmotion}}",
            ],
            async ({target, actor}) => target != null && await allCharacters[actor].knowsSpecificFactAbout('feels', target, allCharacters[target].emotion),
        ),

        new Action(
            [
                "What a striking {{object}}",
                "That is quite a {{object}}",
                "Ooh, a {{object}}",
                "That is a fine looking {{object}}",
                "What a nice {{object}}",
            ],
            async ({object, actor}) => object != null && await allCharacters[actor].likesObject(object),
        ),

        new Action(
            [
                "I do not like that {{object}}",
                "What a horrible {{object}}",
                "Ew, a {{object}}",
                "Get that {{object}} out of here",
                "That is a poor quality {{object}}",
                "I'm offended by that {{object}}",
            ],
            async ({object, actor}) => object != null && !await allCharacters[actor].likesObject(object),
        ),

        new Action(
            [
                "Look at this {{heldObject}}",
                "Have you seen this {{heldObject}}",
                "Take a look at this {{heldObject}} I am holding",
            ],
            ({state, target}) => target != null && state.holding != null,
        ),

        new Action(
            [
                "I like you",
                "You're great",
                "You're the best",
                "I like you a lot",
            ],
            ({actor, target}) => target != null && allCharacters[actor].likes(target),
            ({actor, target}) => allCharacters[target].adjustRelationshipWith(actor, 1.3),
        ),

        new Action(
            [
                "I dislike you",
                "I do not like you",
                "I am not fond of you",
            ],
            ({actor, target}) => target != null && allCharacters[actor].dislikes(target),
            ({actor, target}) => allCharacters[target].adjustRelationshipWith(actor, 0.6),
        ),

        new Action(
            [
                "I would never have guessed you are a {{targetJob}}",
                "Being a {{targetJob}} sounds hard",
                "Being a {{targetJob}} sounds interesting",
                "Now I know who to comem to if I have quesitons about becoming a {{targetJob}}",
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsAnyFactAbout('profession', target),
        ),

        new Action(
            [
                "I remember when I was {{targetAge}}",
                "Ah, to be {{targetAge}} again",
                "Enjoy being {{targetAge}} while you can",
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsAnyFactAbout('age', target) && allCharacters[actor].age > allCharacters[target].age,
        ),

        new Action(
            [
                "I can't wait to be {{targetAge}}",
                "It must be so nice to be {{targetAge}}",
                "I am looking forward to being {{targetAge}} like you",
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsAnyFactAbout('age', target) && allCharacters[actor].age < allCharacters[target].age,
        ),

        new Action(
            [
                "Sometimes I worry that this is as good as it gets",
                "I worry about the future",
                "It's hard to imagine a worse way to spend this day",
                "I often think that the best parts of my life are over",
                "I can't recall when I last felt optimistic",
                "It is difficult to feel hope about the state of the world",
            ],
            ({actor}) => negativeEmotions.indexOf(allCharacters[actor].emotion) != -1,
        ),

        new Action(
            [
                "I can't imagine how this day could be better",
                "What an excellent afternoon",
                "I feel quite content",
                "It is truly a pleasure to be in such rare company",
                "I'm glad to be here at this moment",
                "I've never felt more alive",
                "What a wondrous day to be alive",
            ],
            ({actor}) => positiveEmotions.indexOf(allCharacters[actor].emotion) != -1,
        ),

        new Action(
            [
                "Not everybody is as {{targetEmotion}} as you",
                "You should try being a bit less {{targetEmotion}}",
                "It's a bit much when you're so {{targetEmotion}}",
                "You don't need to be so obviously {{targetEmotion}}",
                "Not everyone needs to know that you're {{targetEmotion}}",
                "When you're so {{targetEmotion}}, it's a bit difficult for everyone who isn't"
            ],
            async ({actor, target}) => {
                return target != null &&
                    (await allCharacters[actor].knowsAnyFactAbout('feels', target)) &&
                    // If one emotion is not present in the list, we'll get -1 * something.
                    (positiveEmotions.indexOf(allCharacters[actor].emotion) *
                     positiveEmotions.indexOf(allCharacters[target].emotion) < 0);
            },
            ({actor, target}) => allCharacters[target].adjustRelationshipWith(actor, 0.6),
        ),

        new Action(
            [
                "I want to hold your hand",
                "Give me your hand, please",
                "I'd like to get to know you better",
                "Could we be friends",
                "Let's get together sometime",
                "I'd like to spend more time with you",
            ],
            ({actor, target}) => target != null && allCharacters[actor].likes(target),
            ({scene, actor, target}) => {
                scene.pending.push(respondToOffer.bind(
                    null, scene, target, actor,
                    exactAction.bind(
                        null,
                        '"Excellent!" ' + allCharacters[actor].firstName + ' says.',
                        () => allCharacters[actor].adjustRelationshipWith(target, 1.3),
                    ),
                    exactAction.bind(
                        null,
                        '"What a shame!" ' + allCharacters[actor].firstName + ' says.',
                        () => allCharacters[actor].adjustRelationshipWith(target, 0.6),
                    ),
                ));
            }
        ),

        new Action(
            [
                "I want to give you this {{heldObject}}",
                "Do you want this {{heldObject}}",
                "Please accept this {{heldObject}}",
                "Take this {{heldObject}} from me",
                "Here, have this {{heldObject}}",
            ],
            ({actor, target, state, targetState}) => target != null && state.holding != null && targetState == null,
            ({scene, actor, target, state, targetState}) => {
                scene.pending.push(respondToOffer.bind(
                    null, scene, target, actor,
                    exactAction.bind(
                        null,
                        allCharacters[actor].firstName + 'gives ' + allCharacters[target].firstName + ' the ' + state.holding + ' .',
                        () => {
                            targetState.holding = state.holding;
                            state.holding = null;
                        }
                    ),
                    exactAction.bind(
                        null,
                        '"Your loss," ' + allCharacters[actor].firstName + ' says.',
                        () => allCharacters[actor].adjustRelationshipWith(target, 0.6),
                    ),
                ));
            }
        ),
    ], {
        'actor': actor,
        'target': target,
        'object': object,
        'state': scene.setting.characterStates[actor],
        'targetState': target != null ? scene.setting.characterStates[target] : null,
        'scene': scene,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': target != null ? allCharacters[target] : null,
        'setting': scene.setting,
        'object': object,
        'heldObject': scene.setting.characterStates[actor].holding,
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' says' + (this.target != null ? ' to ' + this.target.firstName : '') + '.';
        baseText = baseText
            .replace("{{emotion}}", this.actor.emotion)
            .replace("{{environment}}", this.setting.environment)
            .replace("{{age}}", this.actor.age)
            .replace("{{randomAge}}", whole_number(15, 90))
            .replace("{{object}}", this.object)
            .replace("{{heldObject}}", this.heldObject)
        ;
        if (this.target != null) {
            baseText = baseText
                .replace("{{targetEmotion}}", this.target.emotion)
                .replace("{{targetAge}}", this.target.age)
                .replace("{{targetJob}}", this.target.profession)
            ;
        }
        return baseText;
    });
}

function Actions(actions, args) {
    this.actions = actions;
    actions.forEach((action) => {
        ['state', 'condition'].forEach((p) => {
            if (p in action) {
                action[p] = action[p].bind(null, args);
            }
        });
    });
}

async function chooseAction(actionLists) {
    if (!Array.isArray(actionLists) && actionLists instanceof Actions) {
        actionLists = [actionLists];
    }
    let allActions = [];
    let resolvableActions = [];

    actionLists.forEach(list => {
        list.actions.forEach(action => {
            allActions.push(action);
            resolvableActions.push(Promise.resolve(action.condition()));
        });
    });

    // Choose one equally probable action from all valid actions.
    return Promise.all(resolvableActions)
        .then(actions => allActions.filter((action, idx) => actions[idx]))
        .then(validActions => choose(validActions))
}

function Action(text, condition, state) {
    this.text = typeof text == "string" ? [text] : text;
    this.condition = condition || function() { return true };
    if (state) {
        this.state = state;
    }
}

async function reactToGift(scene, actor) {
    const state = scene.setting.characterStates[actor];

    const actions = new Actions([
        new Action(
            [
                "Oh, how wonderful",
                "I do love a good {{object}}",
                "Thank you for this {{object}}",
                "A {{object}}! How wonderful",
                "I will cherish this {{object}}",
                "Thank you",
                "Thanks a lot",
            ],
            async ({actor, state}) => await allCharacters[actor].likesObject(state.holding),
        ),

        new Action(
            [
                "Ew",
                "How gross",
                "This is a terrible {{object}}",
                "I can't believe you would give me such a horrible {{object}}",
                "I have never wanted a {{object}}",
                "Don't make me hold that",
                "Yuck",
                "Gross",
                "Ick",
                "I don't want this {{object}}",
                "I don't like this {{object}}",
            ],
            async ({actor, state}) => await !allCharacters[actor].likesObject(state.holding),
        ),
    ], {
        'actor': actor,
        'state': state,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'object': state.holding,
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' says.';
        return baseText
            .replace("{{object}}", this.object);
    });
}

async function performAction(scene) {
    const actor = choose(scene.setting.characters);
    if (!actor) {
        return null;
    }

    const state = scene.setting.characterStates[actor];

    let target, targetState;
    if (scene.setting.characters.length > 1) {
        target = choose(scene.setting.characters.filter(c => c != actor));
        targetState = scene.setting.characterStates[target];
    }

    const object = choose(scene.setting.objects);

    const targetActions = new Actions([
        // Give current item to another actor
        new Action(
            [
                "hands {{holding}} to {{target}}",
                "gives {{holding}} to {{target}}",
                "passes {{holding}} to {{target}}",
            ],
            ({state, targetState}) => targetState.holding == null && state.holding != null,
            async ({state, targetState, target, actor, scene}) => {
                targetState.holding = state.holding;
                if (await allCharacters[target].likesObject(targetState.holding)) {
                    allCharacters[target].adjustRelationshipWith(actor, 1.3);
                } else {
                    allCharacters[target].adjustRelationshipWith(actor, 0.6);
                }
                state.holding = null;
                scene.pending.push(reactToGift.bind(null, scene, target));
            },
        ),

        new Action(
            [
                "moves towards {{target}} {{emotion}}",
                "steps closer towards {{target}}",
                "takes a step toward {{target}}",
                "inches toward {{target}}",
                "leans closer to {{target}}",
            ]
        ),
        new Action(
            [
                "edges away from {{target}} {{emotion}}",
                "moves away from {{target}}",
                "takes a step back from {{target}}",
                "surreptitiously steps back from {{target}}",
            ]
        ),

        // Look at another actor
        new Action(
            [
                "gazes at {{target}}",
                "looks intently at {{target}}",
                "looks at {{target}} consideringly",
                "looks at {{target}} through half-lidded eyes",
                "glances sidelong at {{target}}",
            ],
            ({state, target}) => state.eyes == "open" && state.lookingAt != target,
            ({state, target}) => state.lookingAt = target,
        ),

        // Look away from another actor
        new Action(
            [
                "looks at {{target}} then quickly looks away",
                "darts a glance at {{target}}",
                "briefly meets {{target}}'s gaze before looking elsewhere",
            ],
            ({state, target}) => state.eyes == "open" && state.lookingAt != target,
            ({state}) => state.lookingAt = null,
        ),

        // Look away from another actor
        new Action(
            [
                "looks away from {{target}}",
                "focuses {{their}} gaze elsewhere",
            ],
            ({state, target}) => state.eyes == "open" && state.lookingAt == target,
            ({state}) => state.lookingAt = null,
        ),
    ], {
        'state': state,
        'targetState': targetState,
        'target': target,
        'actor': actor,
        'scene': scene,
    });

    const soloActions = new Actions([
        // Pick up object in scene
        new Action(
            [
                "picks up {{object}}",
                "takes {{object}}",
            ],
            ({state, object}) => state.holding == null && object,
            ({state, object, setting}) => {
                state.holding = object;
                setting.objects.splice(setting.objects.indexOf(object), 1);
            }
        ),

        // Put down object in scene.
        new Action(
            [
                "replaces {{holding}}",
                "puts down {{holding}}",
                "places {{holding}} back where it came from",
                "lays down {{holding}}",
            ],
            ({state}) => state.holding != null,
            ({setting, state}) => {
                setting.objects.push(state.holding);
                state.holding = null;
            }
        ),

        // Touch an object in scene.
        new Action(
            [
                "runs {{their}} hand along {{object}} {{emotion}}",
                "caresses {{object}} {{emotion}}",
                "slowly trails a finger along the length of {{object}}",
                "lays their hand against {{object}} {{emotion}}",
            ],
            ({state, object}) => state.eyes == "open" && object,
        ),

        // Do not quite touch object in scene.
        new Action(
            [
                "reaches towards {{object}}, but stops {{emotion}} before touching it",
                "starts to reach for {{object}} before thinking better of it",
                "holds out a hand {{emotion}} to {{object}} but stops short",
            ],
            ({state, object}) => state.eyes == "open" && object && !state.holding,
        ),

        // Look at object in scene.
        new Action(
            [
                "gazes at {{object}}",
                "looks at {{object}}",
                "stares at {{object}}",
            ],
            ({state, object}) => state.eyes == "open" && state.lookingAt != object && object,
            ({state, object}) => state.lookingAt = object,
        ),

        // Look at held object.
        new Action(
            [
                "considers {{holding}} in {{their}} hands",
                "looks at {{holding}} in {{their}} hands thoughfully",
                "looks intently at {{holding}} in {{their}} hands",
            ],
            ({state}) => state.eyes == "open" && state.holding,
            ({state}) => state.lookingAt = state.holding,
        ),

        // Look at object and then away.
        new Action(
            [
                "looks at {{object}} then quickly looks away",
                "briefly glances at {{object}} before looking away",
            ],
            ({state, object}) => state.eyes == "open" && state.lookingAt != object && object,
            ({state}) => state.lookingAt = null,
        ),

        // Stop looking at current target.
        new Action(
            [
                "looks elsewhere",
                "looks away",
            ],
            ({state}) => state.eyes == "open" && state.lookingAt != null,
            ({state}) => state.lookingAt = null,
        ),

        // Close eyes.
        new Action(
            "closes {{their}} eyes",
            ({state}) => state.eyes == "open",
            ({state}) => state.eyes = "closed",
        ),

        // Open eyes.
        new Action(
            "opens {{their}} eyes",
            ({state}) => state.eyes == "closed",
            ({state}) => state.eyes = "open",
        ),

        new Action(
            [
                "hums",
                "frowns",
                "smiles",
                "smiles widely",
                "grins",
                "grimaces",
                "smirks",
                "coughs quietly",
                "frowns pensively",
                "shifts",
                "adjusts {{their}} stance",
                "shuffles {{their}} feet",
                "sways {{emotion}}",
                "abruptly sneezes",
                "sniffs loudly",
            ],
        ),
    ], {
        'state': state,
        'object': object,
        'setting': scene.setting,
    });

    let actions = [soloActions];

    if (target != null) {
        actions.push(targetActions);
    }

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': target != null ? allCharacters[target] : null,
        'object': object,
        'holding': state.holding,
        'setting': scene.setting,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.actor.firstName + " " +
            this.text
            .replace("{{their}}", this.actor.pronouns.possessive)
            .replace("{{object}}", "the " + this.object)
            .replace("{{emotion}}", adverb(this.actor.emotion))
            .replace("{{holding}}", "the " + this.holding)
            + ".";
        if (this.target != null) {
            baseText = baseText.replace("{{target}}", this.target.firstName)
        }
        return baseText;
    });
}

function evaluateAction(action, properties, toText) {
    if (!action) {
        return null;
    }

    const result = {
        toText: toText,
        text: choose(action.text),
        stateChange: action.state,
    };

    for (const entry of Object.entries(properties)) {
        result[entry[0]] = entry[1];
    }

    return result;
}

async function introduceSelf2(scene, actor) {
    const actions = new Actions([
        new Action(
            [
                "I am a {{job}}",
                "I'm a {{job}}",
                "I guess you could say I'm a {{job}}",
                "I've been a {{job}} for a while",
                "I just started being a {{job}}",
                "I'm learning how to be a {{job}}",
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('profession', actor, allCharacters[actor].profession),
        ),

        new Action(
            [
                "I'm {{age}}",
                "I'm {{age}} years old",
                "I just turned {{age}}",
                "I'm {{age}} years young",
                "I'm almost {{age}}",
                "I turn {{age}} soon",
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('age', actor, allCharacters[actor].age),
        ),
    ], {
        scene: scene,
        actor: actor,
    });

    let action = await chooseAction(actions);
    let properties = {
        actor: allCharacters[actor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '."';
        return baseText
            .replace("{{job}}", this.actor.profession)
            .replace("{{age}}", this.actor.age)
        ;
    });
}

async function introduceSelf(scene, actor, isReply) {
    const actions = new Actions([
        new Action(
            [
                "My name is {{fullName}}",
                "I'm {{name}}",
                "I'm {{fullName}}",
                "I am {{name}}",
                "{{name}}",
                "{{fullName}}",
                "You can call me {{name}}",
                "{{fullName}}, but you can call me {{name}}",
                "{{fullName}}, but please call me {{name}}",
                "Call me {{name}}",
                "{{lastName}}. {{fullName}}",
                "I go by {{name}}",
                "My friends call me {{name}}",
            ],
            () => true,
            ({scene, actor}) => {
                if (bool()) {
                    scene.pending.push(introduceSelf2.bind(null, scene, actor));
                }
                for (const c of scene.setting.characters.filter((id) => id != actor)) {
                    if (!allCharacters[c].knows(actor)) {
                        allCharacters[c].relationships[actor] = { value: 0.5 };
                    }
                }
            },
        ),
    ], {
        scene: scene,
        actor: actor,
    });

    let action = await chooseAction(actions);
    let properties = {
        actor: allCharacters[actor],
        isReply: isReply,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.isReply ?
            '"' + this.text + '," ' + this.actor.firstName + ' replies.' :
            '"' + this.text + '."'
        ;
        return baseText
            .replace("{{name}}", this.actor.firstName)
            .replace("{{lastName}}", this.actor.lastName)
            .replace("{{fullName}}", this.actor.firstName + ' ' + this.actor.lastName)
        ;
    });
}

async function greetEntry(scene, newActor) {
    const actor = choose(scene.setting.characters);

    const greetRoom = new Actions([
        new Action(
            [
                "Hello everybody",
                "Hello everyone",
                "Hi all",
                "Hi folks",
                "Oh, hi everyone"
            ],
            ({otherCharacters}) => otherCharacters.length > 1,
        ),

        new Action([
            "Hi there",
            "Hello",
        ]),

        new Action(
            [
                "Nice to see everyone",
                "This is a pleasant surprise",
                "How nice to see you all",
            ],
            ({actor, otherCharacters}) => otherCharacters.map((a) => allCharacters[actor].likes(a)).reduce((a, b) => a && b),
        ),

        new Action(
            [
                "Well, this is awkward",
                "What an unpleasant surprise",
                "What a pity we meet again",
            ],
            ({actor, otherCharacters}) => otherCharacters.map((a) => allCharacters[actor].dislikes(a)).reduce((a, b) => a && b),
        ),

        new Action(
            "I don't believe we've met",
            ({actor, otherCharacters}) => otherCharacters.map((a) => !allCharacters[actor].knows(a)).reduce((a, b) => a && b),
        ),
    ], {
        actor: actor,
        otherCharacters: scene.setting.characters.filter((a) => a != newActor),
    });

    const actions = new Actions([
        new Action(
            [
                "Hi there",
                "Hi there {{enteredName}}",
                "Hi {{enteredName}}",
                "Welcome {{enteredName}}",
                "Hello",
                "Hello {{enteredName}}",
                "Welcome",
                "Welcome {{enteredName}}",
                "Nice to see you {{enteredName}}",
                "Nice to see you",
            ],
            ({actor, entered}) => allCharacters[actor].knows(entered),
        ),

        new Action(
            [
                "Who are you",
                "I don't recognize you",
                "You must be new",
                "Are you new here",
                "Hello stranger",
            ],
            ({actor, entered}) => !allCharacters[actor].knows(entered),
            ({scene, entered}) => scene.pending.push(introduceSelf.bind(null, scene, entered, true)),
        ),
    ], {
        actor: actor,
        entered: newActor,
        scene: scene,
    });

    let possibleActions = [];
    if (newActor == actor) {
        possibleActions.push(greetRoom);
    } else {
        possibleActions.push(actions);
    }
    let action = await chooseAction(possibleActions);
    let properties = {
        actor: allCharacters[actor],
        target: allCharacters[newActor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' says.';
        return baseText
            .replace("{{enteredName}}", this.target.firstName)
        ;
    });
}

async function modifySetting(scene) {
    const actor = choose(allCharacters.map(c => c.id));

    const actions = new Actions([
        // An actor enters an environment.
        new Action(
            [
                "walks up",
                "arrives",
                "walks over",
                "appears",
            ],
            ({setting, actor}) => !setting.isPresent(actor),
            ({setting, actor, scene}) => {
                setting.addCharacter(actor);
                scene.pending.push(greetEntry.bind(null, scene, actor));
            }
        ),

        // An actor enters an environment with other characters present.
        new Action(
            [
                "joins the group",
                "notices the others and joins them",
            ],
            ({setting, actor}) => !setting.isPresent(actor) && setting.characters.length > 1,
            ({setting, actor, scene}) => {
                setting.addCharacter(actor);
                scene.pending.push(greetEntry.bind(null, scene, actor));
            }
        ),

        // An actor exits an environment.
        new Action(
            [
                "walks away",
                "leaves",
                "wanders away",
                "strides away",
                "leaves {{environment}} quickly",
                "leaves in a hurry",
            ],
            ({setting, actor, scene}) => setting.isPresent(actor) && actor != scene.povCharacter,
            ({setting, actor}) => setting.removeCharacter(actor),
        ),

        // An actor enters an indoor environment.
        new Action(
            [
                "enters",
                "enters the room",
                "enters {{environment}}",
                "walks through the doorway",
                "wanders into {{environment}}",
                "saunters into the room",
            ],
            ({setting, actor}) => setting.isIndoors && !setting.isPresent(actor),
            ({setting, actor, scene}) => {
                setting.addCharacter(actor);
                scene.pending.push(greetEntry.bind(null, scene, actor));
            }
        ),

        // An actor exits an indoor environment.
        new Action(
            [
                "walks out the door",
                "leaves {{environment}} by the closest door",
                "takes {{their}} leave and walks away",
                "quietly departs",
                "wanders away from {{environment}}",
                "wanders off",
            ],
            ({setting, actor}) => setting.isIndoors && setting.isPresent(actor) && actor != scene.povCharacter,
            ({setting, actor}) => setting.removeCharacter(actor),
        ),
    ], {
        'setting': scene.setting,
        'actor': actor,
        'scene': scene,
    });

    let action = await chooseAction([actions]);
    let properties = {
        actor: allCharacters[actor],
        setting: scene.setting,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.actor.firstName + " " +
            this.text
            .replace("{{environment}}", "the " + this.setting.environment)
            .replace("{{their}}", this.actor.pronouns.possessive)
            + ".";
        return baseText;
    });
}

function Scene(setting, povCharacter) {
    this.actions = [];
    this.setting = setting;
    this.pending = [];
    this.povCharacter = povCharacter ? povCharacter : choose(setting.characters);
    this.actionFilter = null;
}

Scene.prototype.recordFact = function(factName, actor, value) {
    this.setting.characters.filter((id) => id != actor).forEach((id) => {
        allCharacters[id].recordFact(factName, actor, value);
    });
}

Scene.prototype.generateAction = async function() {
    const possibleElements = [
        performDialogue,
        askQuestion,
        performInnerDialogue,
        //describeCharacter,
        //describeEnvironment,
        performAction,
        modifySetting,
    ];

    while (true) {
        let pendingChoice = null;
        if (this.pending.length) {
            pendingChoice = this.pending[0];
            this.pending.splice(0, 1);
        }
        const element = pendingChoice ? pendingChoice : choose(possibleElements);
        let result = await element(this);
        // Ignore selections that turn out to be invalid.
        if (result) {
            if (this.actionFilter && !this.actionFilter(result)) {
                continue;
            }

            let proposed = result.toText();
            // Always let pending responses through, even if they're duplicates.
            if (pendingChoice == null && this.actions.indexOf(proposed) != -1) {
                //console.log('skipping repeated ' + proposed);
                continue;
            }

            // Ensure state isn't updated until value is constructed from current state
            // as of random selection.
            if ("stateChange" in result && result.stateChange) {
                result.stateChange();
            }

            if (proposed.indexOf('{{') != -1) {
                throw "Missing replacement: " + proposed;
            }
            this.actions.push(proposed);
            break;
        }
    }
}

Scene.prototype.generateTransition = async function(timePassed) {
    const actions = new Actions([
        new Action("{{duration}} pass in the blink of an eye."),

        new Action("{{duration}} pass as slow as molasses."),

        new Action("{{duration}} pass uneventfully."),

        new Action("{{duration}} pass surprisingly slowly."),

        new Action("{{duration}} pass surprisingly quickly."),

        new Action("Just like that, it's {{duration}} later."),

        new Action("The next {{duration}} feel like they take forever."),

        new Action("{{duration}} later,"),

        new Action("{{duration}} pass."),
    ], {});

    let action = await chooseAction(actions);
    let properties = {
        duration: timePassed,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.text
            .replace("{{duration}}", this.duration.hours + " hours")
        ;
        return baseText;
    });
}

Scene.prototype.describeObjects = async function() {
    const actions = new Actions([
        new Action(
            [
                "There is a {{object}} nearby.",
                "Nearby is a {{object}}.",
                "Just out of reach is a {{object}}.",
                "A {{object}} sits nearby.",
                "A {{object}} lays nearby.",
                "A {{object}} rests opposite.",
            ],
            ({objects}) => objects.length == 1,
        ),

        new Action(
            [
                "Nearby is {{objects}}.",
                "Nearby, there is {{objects}}.",
                "Just out of reach is {{objects}}.",
                "There is {{objects}} in the vicinity.",
                "There is {{objects}} nearby.",
                "Opposite, there is {{objects}}.",
            ],
            ({objects}) => objects.length > 1,
        ),
    ], {
        objects: this.setting.objects,
    });

    let action = await chooseAction(actions);
    let properties = {
        objects: this.setting.objects,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.text
            .replace("{{object}}", this.objects[0]);
        let o = this.objects.map((o) => "a " + o);
        if (this.objects.length > 2) {
            let s = o.slice(0, o.length - 1).join(", ") + ", and " + o[o.length - 1];
            baseText = baseText.replace("{{objects}}", s);
        } else if (this.objects.length == 2) {
            baseText = baseText.replace("{{objects}}", o.join(" and "));
        }
        return baseText;
    });
}

Scene.prototype.describeSetting = async function() {
    let actor = this.povCharacter;

    const actions = new Actions([
        new Action(
            [
                "{{they}} {{are}} alone.",
                "Nobody else is present.",
                "No one else is with {{them}}.",
            ],
            ({setting}) => setting.characters.length == 1,
        ),

        new Action(
            [
                "{{other}} is keeping {{them}} company.",
                "{{other}} is present as well.",
                "{{they}} {{are}} joined by {{other}}.",
            ],
            ({setting}) => setting.characters.length == 2,
        ),

        new Action(
            [
                "{{others}} are also present.",
                "{{others}} are with {{them}}.",
                "{{others}} are there as well.",
            ],
            ({setting}) => setting.characters.length > 2,
        ),
    ], {
        setting: this.setting,
    });

    this.pending.push(this.describeObjects.bind(this));

    let action = await chooseAction(actions);
    let properties = {
        actor: allCharacters[actor],
        others: this.setting.characters.filter((a) => a != actor).map((a) => allCharacters[a]),
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.text
            .replace("{{they}}", upperCaseWord(this.actor.pronouns.direct))
            .replace("{{them}}", this.actor.pronouns.indirect)
            .replace("{{are}}", conjugate(this.actor, "is"))
        ;
        if (this.others.length) {
            baseText = baseText
                .replace("{{other}}", this.others[0].firstName);

            if (this.others.length > 1) {
                let names = this.others.map((c) => c.firstName);
                let s;
                if (names.length > 2) {
                    s = names.slice(0, names.length - 1).join(', ') + ", and " + names[names.length - 1];
                } else {
                    s = names.join(' and ');
                }
                baseText = baseText.replace("{{others}}", s);
            }
        }
        return baseText;
    });
}

Scene.prototype.generateIntro = async function() {
    let actor = this.povCharacter;

    const actions = new Actions([
        new Action(
            [
                "{{actor}} finds {{themself}} in the {{environment}}.",
                "{{actor}} stands in the {{environment}}.",
                "{{actor}} stands {{emotion}} in the {{environment}}.",
                "{{actor}} sits {{emotion}} in the {{environment}}.",
            ],
        ),
    ], {});

    this.pending.push(this.describeSetting.bind(this));

    let properties = {
        actor: allCharacters[actor],
        environment: this.setting.environment,
    };
    let action = await chooseAction(actions);
    return evaluateAction(action, properties, function() {
        let baseText = this.text
            .replace("{{actor}}", this.actor.firstName)
            .replace("{{themself}}", this.actor.pronouns.reflexive)
            .replace("{{environment}}", this.environment)
            .replace("{{emotion}}", adverb(this.actor.emotion))
        ;
        return baseText;
    });
}

async function createScene(setting, povCharacter) {
    let scene = new Scene(setting, povCharacter);
    if (povCharacter != null && scene.characters.indexOf(povCharacter) == -1) {
        scene.addCharacter(povCharacter);
    }
    let result = await scene.generateIntro();
    scene.actions.push(result.toText());
    const numElements = whole_number(60, 100);
    while (scene.actions.length < numElements || scene.pending.length) {
        await scene.generateAction();
    }
    return scene;
}

/////////////////

const chapterPrefixes = [
    "A",
    "The",
    "One",
];

const chapterModifiers = [
    "",
    "Big",
    "Small",
    "Large",
    "Tiny",
    "Worrying",
    "Positive",
    "New",
    "Old",
    "Wonderful",
    "Wondrous",
    "Tragic",
    "Monstrous",
    "Logical",
    "Powerful",
    "Uncertain",
    "Unknown",
    "Only",
    "Solitary",
    "Real",
    "Pretend",
    "Rational",
    "Inescapable",
    "Disquieting",
    "Concerning",
    "Fundamental",
    "Unique",
    "Underwhelming",
];

const chapterTitles = [
    "Stranger",
    "Friend",
    "Enemy",
    "Nemesis",
    "Ally",
    "Question",
    "Development",
    "Family",
    "Answer",
    "Event",
    "Introduction",
    "Conclusion",
    "Setback",
    "Gift",
    "Instruction",
    "Relationship",
    "Relation",
    "Object",
    "Environment",
    "Creation",
    "Statement",
    "Action",
];

async function create(scenes) {
    let family = createFamily();

    // Create some non-family characters.
    for (var i = 0; i < whole_number(1, 3); i++) {
        character(middleAge());
    }

    /*for (const c of allCharacters) {
      console.log(describeCharacter(c));
      }*/

    let plot = [];
    let lastSetting = null;
    while (scenes-- > 0) {
        if (bool()) {
            character(middleAge());
        }

        let setting;
        if (lastSetting && bool()) {
            setting = lastSetting;
            setting.resetCharacters();
        } else {
            setting = createSetting();
        }
        let scene = await createScene(setting);
        if (lastSetting /*== setting*/ && bool()) {
            scene.actions.splice(0, 0, (await scene.generateTransition({ hours: whole_number(2, 10) })).toText());
        }
        plot.push(scene);
        lastSetting = setting;
    }

    console.log("THE IMPORTANCE OF EARNESTLY BEING")
    console.log()

    let outerDialogue = /"[^"]*"/;
    let innerDialogue = /^'(.*)'/;

    let chapter = 1;

    for (const scene of plot) {
        let title = "Chapter " + chapter++ + ": ";
        title += choose(chapterPrefixes) + " ";
        let modifier = choose(chapterModifiers);
        if (modifier) {
            title += modifier + " ";
        }
        title += choose(chapterTitles);
        console.log(title);
        console.log();

        let actionGroups = [];
        let currentGroup = [];
        let currentSubject;

        for (const action of scene.actions) {
            let possibleSubjects = [];

            // Ignore any character names that appear inside dialogue.
            let minimalActionText = action
                .replace(outerDialogue, "")
                .replace(innerDialogue, "")
            ;
            for (const c of allCharacters) {
                let subjectIndex = minimalActionText.indexOf(c.firstName);
                if (subjectIndex != -1) {
                    possibleSubjects.push([c.id, subjectIndex]);
                }
            }

            // No character name was found; assume it belongs with any previous actions for
            // last known subject.
            if (possibleSubjects.length == 0) {
                currentGroup.push(action);
                continue;
            }

            let subject = possibleSubjects.sort((x, y) => x[1] < y[1] ? -1 : 1)[0][0];

            if (currentSubject == null) {
                currentSubject = subject;
            }

            // If it's not dialogue, we want to include it in the current paragraph.
            if (!action.match(outerDialogue) && !action.match(innerDialogue)) {
                currentGroup.push(action);
                //currentSubject = subject;
                continue;
            }

            // If there is dialogue, we want to start a new group if a different subject
            // is speaking.
            if (subject != currentSubject) {
                actionGroups.push(currentGroup);
                currentGroup = [];
                currentSubject = subject;
            }
            currentGroup.push(action);
        }
        actionGroups.push(currentGroup);

        actionGroups.forEach((actions) => {
            console.log(paragraph(actions));
            console.log();
        })

        console.log("***")
        console.log();
    }

    console.log("The end.")
}

create(process.argv.length > 2 ? parseInt(process.argv[2], 10) : 3);
