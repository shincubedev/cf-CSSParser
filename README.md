# cf-CSSParser

A simple vanilla Javascript snippet that parses a string (of CSS) into a dictionary.

### Assumptions
Only tested to work with: 
i) normal {} and media query, 
ii) non-repeat rules,
iii) correct syntax (ends with ;)

### To use
```
var css_str = '.class{attribute:value;}';
var dictionary = _parseCSS(css_str);
```