module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "angular",
    "parserOptions": {
        "sourceType": "module"
    },
    "globals": {
        "angular": true,
        "notie": true,
        "statusDict": true,
        "host": true
    },
    "rules": {
        "angular/controller-name": [2,"/[A-Z].*Ctrl/"],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};