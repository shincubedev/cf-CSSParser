/**
 * Copyright (c) 2023
 *
 * CraftFamily - CSS Parser (cf-CSSParser)
 * A simple vanilla Javascript snippet that parses a string (of CSS) into a dictionary.
 * 
 * Assumptions: Only tested to work with i) normal {} and media query, ii) non-repeat rules
 * 
 * 
 * @summary Javascript CSS parser
 * @author Shincube <contact@shincube.com>
 *
 * Created at     : 2023-04-28 22:13:22 
 * Last modified  : 2023-04-28 22:13:40
 */

function _tokenizeCSS(css_str){
    // This splits a long string of css into individual group by {}

    var tokens = [];
    var close_req = 1; // usually it's only one, unless we hit a @
    var close_count = 0;
    var close_track_on = false;

    while (css_str.length > 0){
        css_str = css_str.trim(); // important step as we are NOT removing all spaces due to @media
        for (var i = 0; i < css_str.length; i++){
            if (css_str.charCodeAt(i) == 64){ // @
                close_track_on = true;
                close_req = 0; // reset the counters
                close_count = 0;
            }
            else if (css_str.charCodeAt(i) == 123){ // {
                if (close_track_on){
                    close_req++;
                }
            }
            else if (css_str.charCodeAt(i) == 125){ // }
                close_count++;
                if (close_count == close_req){
                    tokens.push(css_str.slice(0, i+1));
                    css_str = css_str.slice(i+1);
                    close_track_on = false;
                    close_req = 1;
                    close_count = 0;
                    break; //restart the string
                }
            }
        }
    }

    return tokens;
}
function _removeSubstringByIdx(str, start_idx, end_idx){
    var a = "";
    var b = "";

    if ( (start_idx >= 0 && start_idx < str.length) &&
        (end_idx >= 0 && end_idx < str.length)){

        if (start_idx > end_idx){ // swap if necessary
            var tmp = start_idx;
            start_idx = end_idx;
            end_idx = tmp; 
        }

        a = str.substring(0, start_idx);
        b = str.substring(end_idx);
    }

    return a+b;
}
function _stripCSSComment(css_str){
    var need_check = true;
    while (need_check){
        need_check = false;

        var start_idx = -1;
        var end_idx = -1;
        for (var i = 0; i < css_str.length-1; i++){
            if (start_idx == -1){
                if (css_str[i] === '/' && css_str[i+1] == '*'){
                    start_idx = i;
                }
            }
            else{
                if (css_str[i] === '*' && css_str[i+1] == '/'){
                    end_idx = i+2; // after the next char
                    need_check = true;
                    css_str = _removeSubstringByIdx(css_str, start_idx, end_idx);
                    break;
                }
            }
        }
    }

    return css_str;
}
function _CSSToKeyValue(css_rule){ // return the values in [key, value] format
    // e.g. '.class{attribute:value;attribute2:value;}'
    // becomes ['.class', 'attribute:value;attribute2:value;']

    var result = [];
    var key = '';
    for (var j = 0; j < css_rule.length; j++){ // get the idx up to {
        if (css_rule.charCodeAt(j) === 123){ // {
            key = css_rule.substring(0, j);
            css_rule = css_rule.substring(j);
            break;
        }
    }

    // remove the first { and last }
    css_rule = css_rule.substring(1);
    css_rule = css_rule.substring(0, css_rule.length-1);
    css_rule = css_rule.trim();

    if (key.length > 0){
        result[0] = key;
        result[1] = css_rule;
    }
    
    return result;
}
function _CSSRulesToArray(css_rule){
    // e.g. 'attribute:value;attribute2:value;' becomes ['attribute:value;','attribute2:value;']
    var result = [];
    var need_check = true;
    while (need_check){
        need_check = false;
        css_rule = css_rule.trim();
        for (var j = 0; j < css_rule.length; j++){ // get the idx up to {
            if (css_rule.charCodeAt(j) === 59){ // ;
                var r = css_rule.substring(0, j+1);
                css_rule = css_rule.substring(j+1);
                result.push(r.trim());
                need_check = true;
                break;
            }
        }
    }
    
    return result;
}
function _stringOccurenceCount(str, to_find){
    // do not use the string split method because e.g. '{ .... } finding {  will return 0 because the number of tokens is only one
    var counter = 0;
    while(str.includes(to_find)){
        counter++;
        str = str.replace(to_find, '');
    }

    return counter;
}
function _CSSToDic(css_str){ // this can be a long css string
    if (typeof css_str == 'string'){
        var tokens = _tokenizeCSS(css_str); //break each long string into individual {} group
        // convert each individual line to a dictionary entry
        var css_dic = {};
        for (var i = 0; i < tokens.length; i++){
            var rule = tokens[i];
            var dic_entry = _CSSToKeyValue(rule); //extract key-value pair from a line
            // check if this is already end or embedded string
            css_dic[dic_entry[0]] = dic_entry[1];

            if (_stringOccurenceCount(dic_entry[1], '{') <= 1){
                css_dic[dic_entry[0]] =_CSSRulesToArray(dic_entry[1]);
            }
        }

        return css_dic;
    }
    else{
        return css_str;
    }
}
function _parseCSS(css_str){ //break down a css_str into a dictionary

    // remove all spaces and breaks for the entire CSS
    css_str = css_str.replace(/\r?\n|\r/g, ''); // remove break lines
    css_str = css_str.replace(/\t/g, ''); // remove tabs
    css_str = css_str.replace(/ +(?= )/g,''); // remove multi spaces

    // strip off comments
    css_str = _stripCSSComment(css_str);
    // css_str = css_str.replace(/\s/g,''); // single spaces - DO NOT REMOVE single spaces this will destroy the @media query
    
    // parse each css rule into one line, including @
    var css_dic = _CSSToDic(css_str); // convert the css string into a dictionary at the top level

    // check if there are any nested css to handle
    var keys = Object.keys(css_dic);
    keys.forEach(function (k){
        if (k.startsWith('@')){
            var nested_dic = _CSSToDic(css_dic[k]);
            css_dic[k] = nested_dic; //replace the value
        }
    });

    return css_dic;
}