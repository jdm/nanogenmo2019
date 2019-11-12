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
    "'",
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
    let [direct, indirect, possessive, reflexive] = pronouns(charGender);

    const newChar = allCharacters.length;
    allCharacters.forEach((c) => {
        c.relationships[newChar] = {
            value: 0,
        };
    });

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
            reflexive: reflexive,
        },
        relationships: {},
        emotion: choose(emotion),
    });
    return newChar;
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

    let numObjects = whole_number(0, objectSource.length);
    let objects = [];
    for (var i = 0; i < numObjects; i++) {
        objects.push(choose(objectSource));
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

function replyToQuestion(scene, actor, target) {
    const actions = new Actions([
        new Action(
            [
                "I'm feeling {{emotion}}",
                "I feel {{emotion}}",
                "I'm {{emotion}}; thanks for asking",
            ],
            ({actor, target}) => allCharacters[actor].relationships[target].value > 0.5,
        ),

        new Action(
            [
                "You don't actually care",
                "You're just pretending to care",
                "Don't ask me that if you don't care",
            ],
            ({actor, target}) => allCharacters[actor].relationships[target].value <= 0.5,
        ),
    ], {
        'actor': actor,
        'target': target,
    });

    let action = chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '", ' + this.actor.firstName + ' replies.';
        baseText = baseText
            .replace("{{emotion}}", this.actor.emotion)
        ;
        return baseText;
    });
}

function askQuestion(scene, selections = {}) {
    const actor = 'actor' in selections ? selections.actor : choose(scene.setting.characters);
    // Can't have dialogue without any characters present.
    if (!actor) {
        return null;
    }

    const target = 'target' in selections ? selections.target : choose(scene.setting.characters.filter((c) => c != actor));
    if (!target) {
        return null;
    }

    const actions = new Actions([
        new Action(
            "How are you",
            () => true,
            ({scene, actor, target}) => scene.pending.push(replyToQuestion.bind(null, scene, target, actor)),
        ),
    ], {
        'scene': scene,
        'actor': actor,
        'target': target,
    });

    let action = chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': allCharacters[target],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '?", ' + this.actor.firstName + ' asks ' + this.target.firstName + '.';
        return baseText;
    });
}

function performInnerDialogue(scene) {
    let actor = scene.povCharacter;

    const target = choose(scene.setting.characters.filter((c) => c != actor));

    const actions = new Actions([
        new Action(
            "I wonder why {{targetName}} is so {{targetEmotion}}",
            ({target}) => target != null,
        ),

        new Action(
            [
                "Oh no, not {{targetName}} again",
                "{{targetName}} is the worst",
            ],
            ({target}) => target != null && allCharacters[actor].relationships[target].value <= 0.5,
        ),

        new Action(
            [
                "{{targetName}} is great",
                "I like {{targetName}}",
                "I hope {{targetName}} likes me",
            ],
            ({target}) => target != null && allCharacters[actor].relationships[target].value > 0.5,
        ),
    ], {
        target: target,
    });

    let action = chooseAction(actions);
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
            ;
        }
        return baseText;
    });
}

function performDialogue(scene) {
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
        'state': scene.setting.characterStates[actor],
    });

    let action = chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': target != null ? allCharacters[target] : null,
        'setting': scene.setting,
        'object': object,
        'heldObject': scene.setting.characterStates[actor].holding,
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

function performAction(scene) {
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
        'setting': scene.setting,
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
        'setting': scene.setting,
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
    if (!action) {
        return null;
    }

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

function modifySetting(scene) {
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
            ({setting, actor, scene}) => !setting.isIndoors && setting.isPresent(actor) && actor != scene.povCharacter,
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
            ({setting, actor}) => setting.isIndoors && setting.isPresent(actor) && actor != scene.povCharacter,
            ({setting, actor}) => setting.removeCharacter(actor),
        ),
    ], {
        'setting': scene.setting,
        'actor': actor,
        'scene': scene,
    });

    let action = chooseAction([actions]);
    let properties = {
        actor: allCharacters[actor],
        setting: scene.setting,
    };
    return evaluateAction(action, properties, function() {
        let baseText = this.actor.firstName + " " +
            this.text
            .replace("{{environment}}", "the " + this.setting.environment)
            + ".";
        return baseText;
    });
}

function Scene(setting, povCharacter) {
    this.actions = [];
    this.setting = setting;
    this.pending = [];
    this.povCharacter = povCharacter ? povCharacter : choose(setting.characters);
}

Scene.prototype.generateAction = function() {
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
        const pendingChoice = chooseAndRemove(this.pending);
        const element = pendingChoice ? pendingChoice : choose(possibleElements);
        const result = element(this);
        // Ignore selections that turn out to be invalid.
        if (result) {
            this.actions.push(result);
            break;
        }
    }
}

Scene.prototype.generateTransition = function(previousScene, timePassed) {
}

function createScene(setting, povCharacter) {
    let scene = new Scene(setting, povCharacter);
    const numElements = whole_number(10, 20);
    while (scene.actions.length < numElements) {
        scene.generateAction();
    }
    return scene;
}

/////////////////

let family = createFamily();
let homeSetting = createSetting();

let plot = [];

// introduce characters and setting
let introScene = createScene(homeSetting);
plot.push(introScene);

// introduce stranger
homeSetting.resetCharacters();
if (homeSetting.characters.indexOf(introScene.povCharacter) == -1) {
    homeSetting.addCharacter(introScene.povCharacter);
}
let stranger = character();
let strangerScene = createScene(homeSetting)
strangerScene.generateTransition(introScene, { hours: whole_number(1, 5) });
plot.push(strangerScene);

for (const scene of plot) {
    console.log(paragraph(scene.actions.map((e) => e.toText())));
    console.log();
}

console.log("The end.")

