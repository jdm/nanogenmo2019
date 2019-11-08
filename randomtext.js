exports.reduce = function(item) {
    if (Array.isArray(item)) {
        return exports.reduce(exports.choose(item));
    }
    if (typeof item === "function") {
        return exports.reduce(item());
    }
    return item;
}

exports.combine = function(list) {
    if (!Array.isArray(list)) {
        list = [list];
    }
    var combined = "";
    for (var i = 0; i < list.length; i++) {
        combined += exports.reduce(list[i]) + ' ';
    }
    return combined.slice(0, combined.length - 1);
}

exports.choose = function(list) {
  if (list.length == 0) {
    return null;
  }
  return list[Math.floor(Math.random() * list.length)];
}

exports.chooseAndRemove = function(list) {
    if (list.length == 0) {
        return null;
    }
    let choice = Math.floor(Math.random() * list.length);
    let item = list[choice];
    list.splice(choice, 1);
    return item;
}

exports.floating_point_number = function(start, end) {
    return Math.random() * (end - start) + start;
}

exports.whole_number = function(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}

exports.bool = function() {
    return !!exports.whole_number(0, 2);
}

function percentage() {
    return exports.whole_number(0, 100) + "%";
}

exports.childAge = function() {
    return exports.whole_number(1, 12);
}

exports.teenAge = function() {
    return exports.whole_number(13, 17);
}

exports.youngAdultAge = function() {
    return exports.whole_number(18, 29);
}

exports.middleAge = function() {
    return exports.whole_number(30, 50);
}

exports.oldAge = function() {
    return exports.whole_number(51, 90);
}

exports.paragraph = function(list) {
    if (!Array.isArray(list)) {
        throw "Paragraph is not an array";
    }
    let result = [];
    for (const sentence of list) {
        let combined = exports.combine(sentence).replace(" .", ".").replace(" ,", ",");
        if (combined) {
            result.push(combined[0].toUpperCase() + combined.slice(1));
        }
    }
    return exports.combine(result);
}
