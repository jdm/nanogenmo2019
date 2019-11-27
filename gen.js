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
    return this.knows(id) && this.relationships[id].value > 0.5;
}

Character.prototype.dislikes = function(id) {
    return this.knows(id) && this.relationships[id].value <= 0.5;
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
];

let negativeEmotions = [
    "sad",
    "disgruntled",
    "distraught",
    "bored",
    "tired",
    "frustrated",
    "upset",
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

async function replyToQuestion(scene, actor, target) {
    const actions = new Actions([
        new Action(
            [
                "I'm feeling {{emotion}}",
                "I feel {{emotion}}",
                "I'm {{emotion}}; thanks for asking",
            ],
            ({actor, target}) => allCharacters[actor].likes(target),
            ({scene, actor}) => scene.recordFact('feels', actor, allCharacters[actor].emotion),
        ),

        new Action(
            [
                "You don't actually care",
                "You're just pretending to care",
                "Don't ask me that if you don't care",
            ],
            ({actor, target}) => allCharacters[actor].dislikes(target),
        ),

        new Action(
            [
                "We don't know each other",
                "I'd prefer not to answer that",
                "That's a very personal question",
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
        let baseText = '"' + this.text + '", ' + this.actor.firstName + ' replies.';
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

    const actions = new Actions([
        new Action(
            [
                "How are you",
                "How are you doing",
                "How is it going",
                "How are things",
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
                return await allCharacters[actor].knowsAnyFactAbout('profession', target) &&
                    await allCharacters[actor].knowsAnyFactAbout('age', target);
            },
            ({actor, target}) => {
                if (allCharacters[target].knows(actor)) {
                    allCharacters[target].adjustRelationshipWith(actor, 0.6);
                }
            }
        ),
    ], {
        'scene': scene,
        'actor': actor,
        'target': target,
    });

    let action = await chooseAction(actions);
    let properties = {
        'actor': allCharacters[actor],
        'target': allCharacters[target],
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '?", ' + this.actor.firstName + ' asks ' + this.target.firstName + '.';
        return baseText;
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
            ],
            async ({actor, target}) => target != null && await allCharacters[actor].knowsSpecificFactAbout('feels', target, allCharacters[target].emotion),
        ),

        new Action(
            [
                "Oh no, not {{targetName}} again",
                "{{targetName}} is the worst",
            ],
            ({actor, target}) => target != null && allCharacters[actor].dislikes(target),
        ),

        new Action(
            [
                "{{targetName}} is great",
                "I like {{targetName}}",
                "I hope {{targetName}} likes me",
            ],
            ({target}) => target != null && allCharacters[actor].likes(target),
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
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('feels', actor, allCharacters[actor].emotion),
        ),

        new Action(
            [
                "I am {{age}} but I feel {{randomAge}}",
                "It's not easy being {{age}}",
                "I'm living my best life as a {{age}} year old",
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
            ],
            async ({object, actor}) => object != null && await allCharacters[actor].likesObject(object),
        ),

        new Action(
            [
                "I do not like that {{object}}",
                "What a horrible {{object}}",
                "Ew, a {{object}}",
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
                "Not everybody is as {{targetEmotion}} as you",
                "You should try being a bit less {{targetEmotion}}",
                "It's a bit much when you're so {{targetEmotion}}",
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
    ], {
        'actor': actor,
        'target': target,
        'object': object,
        'state': scene.setting.characterStates[actor],
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
        'actor': actor,
        'scene': scene,
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
            ],
            () => true,
            ({scene, actor}) => scene.recordFact('profession', actor, allCharacters[actor].profession),
        ),

        new Action(
            [
                "I'm {{age}}",
                "I'm {{age}} years old",
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

async function introduceSelf(scene, actor) {
    const actions = new Actions([
        new Action(
            [
                "My name is {{name}}",
                "I'm {{name}}",
                "I am {{name}}",
                "{{name}}",
                "You can call me {{name}}",
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
    };
    return evaluateAction(action, properties, function() {
        let baseText = '"' + this.text + '," ' + this.actor.firstName + ' replies.';
        return baseText
            .replace("{{name}}", this.actor.firstName)
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
            ],
            ({actor, entered}) => allCharacters[actor].knows(entered),
        ),

        new Action(
            "Who are you",
            ({actor, entered}) => !allCharacters[actor].knows(entered),
            ({scene, entered}) => scene.pending.push(introduceSelf.bind(null, scene, entered)),
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
        // An actor enters an outdoor environment.
        new Action(
            [
                "walks up",
                "arrives",
            ],
            ({setting, actor}) => !setting.isIndoors && !setting.isPresent(actor),
            ({setting, actor, scene}) => {
                setting.addCharacter(actor);
                scene.pending.push(greetEntry.bind(null, scene, actor));
            }
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
            ({setting, actor, scene}) => {
                setting.addCharacter(actor);
                scene.pending.push(greetEntry.bind(null, scene, actor));
            }
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

    let action = await chooseAction([actions]);
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
        const pendingChoice = chooseAndRemove(this.pending);
        const element = pendingChoice ? pendingChoice : choose(possibleElements);
        let result = await element(this);
        // Ignore selections that turn out to be invalid.
        if (result) {
            if (this.actionFilter && !this.actionFilter(result)) {
                continue;
            }

            let proposed = result.toText();
            if (this.actions.indexOf(proposed) != -1) {
                continue;
            }

            // Ensure state isn't updated until value is constructed from current state
            // as of random selection.
            if ("stateChange" in result && result.stateChange) {
                result.stateChange();
            }

            this.actions.push(proposed);
            break;
        }
    }
}

Scene.prototype.generateTransition = async function(previousScene, timePassed) {
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

Scene.prototype.generateIntro = async function() {
    let actor = this.povCharacter;

    const actions = new Actions([
        new Action("{{actor}} finds {{themself}} in the {{environment}}."),

        new Action("{{actor}} is standing in the {{environment}}."),

        new Action("{{actor}} is standing {{emotion}} in the {{environment}}."),
    ], {});

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
            .replace("{{emotion}}", this.actor.emotion + "ly")
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
    const numElements = whole_number(10, 20);
    while (scene.actions.length < numElements || scene.pending.length) {
        await scene.generateAction();
    }
    return scene;
}

/////////////////

async function create() {
    let family = createFamily();
    let homeSetting = createSetting();

    // Create some non-family characters.
    for (var i = 0; i < whole_number(1, 3); i++) {
        character(middleAge());
    }

    /*for (const c of allCharacters) {
      console.log(describeCharacter(c));
      }*/

    let plot = [];

    // introduce characters and setting
    let introScene = await createScene(homeSetting);
    plot.push(introScene);

    // introduce stranger
    homeSetting.resetCharacters();
    let stranger = character(middleAge());
    let strangerScene = await createScene(homeSetting)
    strangerScene.actions.splice(0, 0, (await strangerScene.generateTransition(introScene, { hours: whole_number(2, 6) })).toText());
    plot.push(strangerScene);

    for (const scene of plot) {
        console.log(paragraph(scene.actions));
        console.log();
    }

    console.log("The end.")
}

create();
