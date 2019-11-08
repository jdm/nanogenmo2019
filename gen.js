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

function createSetting() {
    let minCharacters = Math.min(1, allCharacters.length);
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

    let setting = new Setting(environment, objects, isIndoors);
    characters.forEach(id => {
        setting.addCharacter(id);
    });

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

console.log();

let setting = createSetting();
console.log(describeSetting(setting));

function performDialogue(setting) {
    const actor = choose(setting.characters);
    // Can't have dialogue without any characters present.
    if (!actor) {
        return null;
    }

    const target = choose(setting.characters.filter((c) => c != actor));
    const object = choose(setting.objects);

    const actions = new Actions([
        new Action(
            [
                "I feel {{emotion}}",
                "This {{environment}} makes me feel {{emotion}}",
                "I am {{age}} but I feel {{randomAge}}",
            ]
        ),

        new Action(
            [
                "You look {{targetEmotion}}",
                "You look like you are {{targetEmotion}}",
            ],
            ({target}) => target != null,
        ),

        new Action(
            [
                "What a striking {{object}}",
                "I do not like that {{object}}",
                "What a horrible {{object}}",
                "That is quite a {{object}}",
            ],
            ({object}) => object != null,
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
            "I like you",
            ({actor, target}) => target != null && allCharacters[actor].relationships[target].value > 0.5,
            ({actor, target}) => allCharacters[target].relationships[actor].value *= 1.3,
        ),

        new Action(
            [
                "I dislike you",
                "I do not like you",
            ],
            ({actor, target}) => target != null && allCharacters[actor].relationships[target].value <= 0.5,
            ({actor, target}) => allCharacters[target].relationships[actor].value *= 0.6,
        ),
    ], {
        'actor': actor,
        'target': target,
        'object': object,
        'state': setting.characterStates[actor],
    });

    let action = chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': target != null ? allCharacters[target] : null,
        'setting': setting,
        'object': object,
        'heldObject': setting.characterStates[actor].holding,
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '", ' + this.actor.firstName + ' says' + (this.target != null ? ' to ' + this.target.firstName : '') + '.';
        baseText = baseText
            .replace("{{emotion}}", this.actor.emotion)
            .replace("{{environment}}", this.setting.environment)
            .replace("{{age}}", this.actor.age)
            .replace("{{randomAge}}", whole_number(15, 90))
            .replace("{{object}}", this.object)
            .replace("{{heldObject}}", this.heldObject)
        ;
        if (this.target != null) {
            baseText = baseText.replace("{{targetEmotion}}", this.target.emotion);
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

function chooseAction(actionLists) {
    if (!Array.isArray(actionLists) && actionLists instanceof Actions) {
        actionLists = [actionLists];
    }
    let validActions = [];
    actionLists.forEach(list => {
        const valid = list.actions.filter(action => {
            // An action is valid if it has no conditions, or its conditions are true.
            return !("condition" in action) || action.condition();
        });
        validActions.push.apply(validActions, valid);
    });

    // Choose one equally probable action from all valid actions.
    return choose(validActions);
}

function Action(text, condition, state) {
    this.text = typeof text == "string" ? [text] : text;
    if (condition) {
        this.condition = condition;
    }
    if (state) {
        this.state = state;
    }
}

function performAction(setting) {
    const actor = choose(setting.characters);
    if (!actor) {
        return null;
    }

    const state = setting.characterStates[actor];

    let target, targetState;
    if (setting.characters.length > 1) {
        target = choose(setting.characters.filter(c => c != actor));
        targetState = setting.characterStates[target];
    }

    const object = choose(setting.objects);

    const targetActions = new Actions([
        // Give current item to another actor
        new Action(
            [
                "hands {{holding}} to {{target}}",
                "gives {{holding}} to {{target}}",
                "passes {{holding}} to {{target}}",
            ],
            ({state, targetState}) => targetState.holding == null && state.holding != null,
            ({state, targetState}) => {
                targetState.holding = state.holding;
                state.holding = null;
            },
        ),

        new Action("moves towards {{target}} {{emotion}}"),
        new Action("edges away from {{target}} {{emotion}}"),

        // Look at another actor
        new Action(
            "gazes at {{target}}",
            ({state, target}) => state.eyes == "open" && state.lookingAt != target,
            ({state, target}) => state.lookingAt = target,
        ),

        // Look away from another actor
        new Action(
            "looks at {{target}} then quickly looks away",
            ({state, target}) => state.eyes == "open" && state.lookingAt != target,
            ({state}) => state.lookingAt = null,
        ),
    ], {
        'state': state,
        'targetState': targetState,
        'target': target,
    });

    const soloActions = new Actions([
        // Pick up object in scene
        new Action(
            "picks up {{object}}",
            ({state, object}) => state.holding == null && object,
            ({state, object, setting}) => {
                state.holding = object;
                setting.objects.splice(setting.objects.indexOf(object), 1);
            }
        ),

        // Put down object in scene.
        new Action(
            "replaces {{holding}}",
            ({state}) => state.holding != null,
            ({setting, state}) => {
                setting.objects.push(state.holding);
                state.holding = null;
            }
        ),

        // Touch an object in scene.
        new Action(
            "runs {{their}} hand along {{object}} {{emotion}}",
            ({state}) => state.eyes == "open" && object,
        ),

        // Do not quite touch object in scene.
        new Action(
            "reaches towards {{object}}, but stops {{emotion}} before touching it",
            ({state, object}) => state.eyes == "open" && object && !state.holding,
        ),

        // Look at object in scene.
        new Action(
            "gazes at {{object}}",
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
            "looks at {{object}} then quickly looks away",
            ({state, object}) => state.eyes == "open" && state.lookingAt != object && object,
            ({state}) => state.lookingAt = null,
        ),

        new Action("shuffles {{their}} feet"),

        // Stop looking at current target.
        new Action(
            "looks elsewhere",
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

        new Action("hums"),
        new Action("sways {{emotion}}"),
    ], {
        'state': state,
        'object': object,
        'setting': setting,
    });

    let actions = [soloActions];

    if (target) {
        actions.push(targetActions);
    }

    let action = chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': target ? allCharacters[target] : null,
        'object': object,
        'holding': state.holding,
        'setting': setting,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.actor.firstName + " " +
            this.text
            .replace("{{their}}", this.actor.pronouns.possessive)
            .replace("{{object}}", "the " + this.object)
            .replace("{{emotion}}", this.actor.emotion + "ly")
            .replace("{{holding}}", "the " + this.holding)
            + ".";
        if (this.target != null) {
            baseText = baseText.replace("{{target}}", this.target.firstName)
        }
        return baseText;
    });
}

function evaluateAction(action, properties, toText) {
    const result = {
        toText: toText,
        text: choose(action.text),
    };

    for (const entry of Object.entries(properties)) {
        result[entry[0]] = entry[1];
    }

    // Ensure state isn't updated until value is constructed from current state
    // as of random selection.
    if ("state" in action) {
        action.state();
    }

    return result;
}

function modifySetting(setting) {
    const actor = choose(allCharacters.map(c => c.id));

    const actions = new Actions([
        // An actor enters an outdoor environment.
        new Action(
            [
                "walks up",
                "arrives",
            ],
            ({setting, actor}) => !setting.isIndoors && !setting.isPresent(actor),
            ({setting, actor}) => setting.addCharacter(actor),
        ),

        // An actor exits an outdoor environment.
        new Action(
            [
                "walks away",
                "leaves",
            ],
            ({setting, actor}) => !setting.isIndoors && setting.isPresent(actor),
            ({setting, actor}) => setting.removeCharacter(actor),
        ),

        // An actor enters an indoor environment.
        new Action(
            [
                "enters",
                "enters {{environment}}",
                "walks through the door",
            ],
            ({setting, actor}) => setting.isIndoors && !setting.isPresent(actor),
            ({setting, actor}) => setting.addCharacter(actor),
        ),

        // An actor exits an indoor environment.
        new Action(
            [
                "walks out the door",
                "leaves",
                "leaves {{environment}}",
            ],
            ({setting, actor}) => setting.isIndoors && setting.isPresent(actor),
            ({setting, actor}) => setting.removeCharacter(actor),
        ),
    ], {
        'setting': setting,
        'actor': actor,
    });

    let action = chooseAction([actions]);
    let properties = {
        actor: allCharacters[actor],
        setting: setting,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.actor.firstName + " " +
            this.text
            .replace("{{environment}}", "the " + this.setting.environment)
            + ".";
        return baseText;
    });
}

function createScene(setting) {
    const possibleElements = [
        performDialogue,
        //performInnerDialogue,
        //describeCharacter,
        //describeEnvironment,
        performAction,
        modifySetting,
    ];

    const numElements = whole_number(10, 20);
    let elements = [];
    for (var i = 0; i < numElements; i++) {
        const element = choose(possibleElements);
        const result = element(setting);
        // Ignore selections that turn out to be invalid.
        if (!result) {
            i--;
            continue;
        }
        elements.push(result);
    }
    return elements;
}

console.log();

let scene = createScene(setting);
console.log(paragraph(scene.map((e) => e.toText())));
