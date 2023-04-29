# cf-CSSParser

A simple vanilla Javascript snippet that parses a string (of CSS) into a dictionary.

### Assumptions
Only tested to work with: 
i) normal {} and media query, 
ii) non-repeat rules (no checks is done that the same rule has existed),
iii) correct syntax (ends with ;)

### To 
To parse:
```
var css_str = '.class{attribute:value;}';
var dictionary = _parseCSS(css_str);
```

To reconstruct string:
```
var css_str_construct = __cssDicToString(dictionary);
```