module.exports.descriptionToArray = function(desc) {
    desc = desc.split('&amp;').join();
    //split desc by html tags 
    let arr = desc.split(/(<\/*[a-zA-Z]+>)/g);
    //remover empty words
    arr = arr.filter(function(word) {
        return word != "";
    });
    return arr;
};