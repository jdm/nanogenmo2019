let {
    choose,
    combine,
    reduce,
    paragraph,
    youngAdultAge,
    middleAge,
    whole_number,
    bool,
} = require("./randomtext");

const firstNameStart = [
    "Ja",
    "Jo",
    "Ar",
    "At",
    "To",
    "Ma",
    "Po",
    "Ro",
    "Ra",
    "Sen",
    "Son",
    "Dar",
    "Mar",
    "Don",
    "Ben",
];

const firstNameEnd = [
    "ne",
    "no",
    "ro",
    "se",
    "sh",
    "ta",
    "to",
    "tu",
    "va",
    "ve",
    "du",
    "ren",
    "sen",
    "ten",
    "ton",
    "tan",
    "tash",
    "cus",
    "den",
    "dan",
    "don",
];

const nameSeparators = [
    "",
    "'",
    "-",
];

function firstName() {
    return choose(firstNameStart) + choose(nameSeparators) + choose(firstNameEnd);
}

const lastNameStart = [
    "Abe",
    "Bea",
    "Cal",
    "Dre",
    "Ero",
    "Fra",
    "Fer",
    "Gor",
    "Ger",
    "Gin",
    "Hue",
    "Han",
    "Jun",
    "Jon",
    "Jar",
];

const lastNameEnd = [
    "na",
    "ta",
    "tte",
    "son",
    "bas",
    "ron",
    "ra",
    "sa",
    "to",
    "sun",
    "wen",
    "wei",
    "men",
    "lon",
    "len",
    "fen",
    "cy",
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

const gender = [
    "male",
    "female",
    "non-binary",
];

function pronouns(gender) {
    switch (gender) {
    case "male":
        return ["he", "him", "his"];
    case "female":
        return ["she", "her", "her"];
    case "non-binary":
        return ["they", "them", "their"];
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

let allCharacters = [];

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

function character(age) {
    let charGender = choose(gender);
    let [direct, indirect, possessive] = pronouns(charGender);

    allCharacters.push({
        id: allCharacters.length,
        firstName: firstName(),
        lastName: lastName(),
        profession: choose(profession),
        age: age,
        gender: charGender,
        pronouns: {
            direct: direct,
            indirect: indirect,
            possessive: possessive,
        },
        relationships: {},
        emotion: choose(emotion),
    });
    return allCharacters.length - 1;
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

function createFamily() {
    let numParents = 0, numChildren = 0;
    while (numParents + numChildren < 2) {
        numParents = whole_number(0, 4);
        numChildren = whole_number(0, 4);
    }

    let parents = [];
    for (var i = 0; i < numParents; i++) {
        parents.push(character(middleAge()));
    }
    let children = [];
    for (var i = 0; i < numChildren; i++) {
        children.push(character(youngAdultAge()));
    }

    for (var i = 0; i < numParents; i++) {
        for (var j = 0; j < numParents; j++) {
            if (i == j) {
                continue;
            }
            symmetricRelationship("spouse", parents[i], 1.0, parents[j], 1.0);
        }
        for (var j = 0; j < numChildren; j++) {
            asymmetricRelationship("child", parents[i], 1.0, "parent", children[j], 1.0);
        }
    }

    for (var i = 0; i < numChildren; i++) {
        for (var j = 0; j < numChildren; j++) {
            if (i == j) {
                continue;
            }
            symmetricRelationship("sibling", children[i], 1.0, children[j], 1.0);
        }
    }

    return parents.concat(children);
}

let emotion = [
    "sad",
    "happy",
    "disgruntled",
    "amorous",
    "distraught",
    "bored",
    "excited",
    "delighted",
    "excited",
    "tired",
    "frustrated",
    "upset",
    "rapturous",
    "lonely",
    "nervous",
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

let family = createFamily();
for (const m of family) {
    console.log(describeCharacter(allCharacters[m]));
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

function createSetting() {
    let minCharacters = Math.min(2, allCharacters.length);
    let maxCharacters = Math.min(4, allCharacters.length);
    let numCharacters = whole_number(minCharacters, maxCharacters);
    let characters = [];
    while (characters.length < numCharacters) {
        let char = whole_number(0, allCharacters.length);
        if (characters.indexOf(char) == -1) {
            characters.push(char);
        }
    }

    const isIndoors = bool();
    const environment = isIndoors ? choose(indoorEnvironments) : choose(outdoorEnvironments);
    const objectSource = isIndoors ? indoorObject : outdoorObject;

    let numObjects = whole_number(0, objectSource.length);
    let objects = [];
    for (var i = 0; i < numObjects; i++) {
        objects.push(choose(objectSource));
    }

    let states = {};
    characters.forEach(id => {
        states[id] = {
            lookingAt: null,
            eyes: "open",
            holding: null,
        };
    });

    return {
        environment: environment,
        characters: characters,
        characterStates: states,
        pointOfView: choose(characters),
        objects: objects,
    };
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

    const actions = [
        "sitting",
        "standing",
        "lying",
        "talking",
        "walking",
        "running",
    ];

    const rest = [
        verb,
        choose(actions),
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

console.log();

let setting = createSetting();
console.log(describeSetting(setting));

function performDialogue(setting) {
    const speaker = choose(setting.characters);
    const target = bool() ? choose(setting.characters) : null;
    const relationships = allCharacters[speaker].relationships;
    const relationship = target in relationships ? relationships[target] : 1.0;
    const choices = [
    ];
}

function performAction(setting) {
    const actor = choose(setting.characters);
    const state = setting.characterStates[actor];
    const realActor = allCharacters[actor];
    let target;
    do {
        target = choose(setting.characters);
    } while (target == actor);
    const targetState = setting.characterStates[target];
    const object = choose(setting.objects);
    const actions = [
        {
            text: "picks up {{object}}",
            condition: () => state.holding == null && object,
            state: () => {
                state.holding = object;
                setting.objects.splice(setting.objects.indexOf(object), 1);
            }
        },
        {
            text: "replaces {{holding}}",
            condition: () => state.holding != null,
            state: () => {
                setting.objects.push(state.holding);
                state.holding = null;
            }
        },
        {
            text: [
                "hands {{holding}} to {{target}}",
                "gives {{holding}} to {{target}}",
                "passes {{holding}} to {{target}}",
            ],
            condition: () => targetState.holding == null && state.holding != null,
            state: () => {
                targetState.holding = state.holding;
                state.holding = null;
            },
        },
        {
            text: "runs {{their}} hand along {{object}} {{emotion}}",
            condition: () => state.eyes == "open" && object,
        },
        {
            text: "reaches towards {{object}}, but stops {{emotion}} before touching it",
            condition: () => state.eyes == "open" && object && !state.holding,
        },
        "moves towards {{target}} {{emotion}}",
        "edges away from {{target}} {{emotion}}",
        {
            text: "gazes at {{object}}",
            state: () => state.lookingAt = object,
            condition: () => state.eyes == "open" && state.lookingAt != object && object,
        },
        {
            text: "gazes at {{target}}",
            state: () => state.lookingAt = target,
            condition: () => state.eyes == "open" && state.lookingAt != target,
        },
        {
            text: [
                "considers {{holding}} in {{their}} hands",
                "looks at {{holding}} in {{their}} hands thoughfully",
                "looks intently at {{holding}} in {{their}} hands",
            ],
            state: () => state.lookingAt = state.holding,
            condition: () => state.eyes == "open" && state.holding,
        },
        {
            text: "looks at {{object}} then quickly looks away",
            state: () => state.lookingAt = null,
            condition: () => state.eyes == "open" && state.lookingAt != object && object,
        },
        {
            text: "looks at {{target}} then quickly looks away",
            state: () => state.lookingAt = null,
            condition: () => state.eyes == "open" && state.lookingAt != target,
        },
        "shuffles {{their}} feet",
        {
            text: "looks elsewhere",
            state: () => state.lookingAt = null,
            condition: () => state.eyes == "open" && state.lookingAt != null,
        },
        {
            text: "closes {{their}} eyes",
            state: () => state.eyes = "closed",
            condition: () => state.eyes == "open",
        },
        {
            text: "opens {{their}} eyes",
            state: () => state.eyes = "open",
            condition: () => state.eyes == "closed",
        },
        "hums",
        "sways {{emotion}}",
    ];
    const validActions = actions.filter(action => {
        return typeof action == "string" ||
            !("condition" in action) ||
            action.condition()
    });
    let action = choose(validActions);
    if (typeof action == "string") {
        action = { text: action };
    }
    if (typeof action.text == "string") {
        action.text = [action.text];
    }
    const result = {
        toText: function() {
            const actor = allCharacters[this.actor];
            return actor.firstName + " " +
                this.text
                .replace("{{their}}", actor.pronouns.possessive)
                .replace("{{object}}", "the " + this.object)
                .replace("{{emotion}}", actor.emotion + "ly")
                .replace("{{target}}", allCharacters[this.target].firstName)
                .replace("{{holding}}", "the " + this.holding)
                + ".";
        },
        actor: actor,
        target: target,
        object: object,
        holding: state.holding,
        text: choose(action.text),
    };
    // Ensure state isn't updated until value is constructed from current state
    // as of random selection.
    if ("state" in action) {
        action.state();
    }
    return result;
}

function createScene(setting) {
    const possibleElements = [
        //performDialogue,
        //performInnerDialogue,
        //describeCharacter,
        //describeEnvironment,
        performAction,
    ];

    const numElements = whole_number(10, 20);
    let elements = [];
    for (var i = 0; i < numElements; i++) {
        const element = choose(possibleElements);
        elements.push(element(setting));
    }
    return elements;
}

console.log();

let scene = createScene(setting);
console.log(paragraph(scene.map((e) => e.toText())));
