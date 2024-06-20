import { inspect } from "util"
import { parseXML } from "./parser.js"


const empty = ``
const text = `Sample "Text"!`
const node = `<root></root>`
const nodetext = `<root>Sample "Text"!</root>`

const selfclose = `<root/>`
const attr = `<root attr="test"/>`
const boolattr = `<root attr/>`

console.log( parseXML( empty ) )
console.log( parseXML( text ) )
console.log( parseXML( node ) )
console.log( parseXML( nodetext ) )

console.log( parseXML( selfclose ) )
console.log( parseXML( attr ) )
console.log( parseXML( boolattr ) )

const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>DrDesten - Home</title>
    <meta name="description" content="Homepage of DrDesten, creator of DrDestens MinecraftShaders and Stracciatella Shaders. Check out my tools: Gaussian Kernel Calculator, Vogel Disk Calculator, Array Progressifier, Probability distribution analyzer"/>
    <link rel="icon" type="image/png" href="icons/icon_main.png"/>
<link rel="stylesheet" href="defaultstyles.css"/>
<link rel="stylesheet" href="general.css"/>
    <noscript>
        <link rel="stylesheet" href="noscript.css"/>
    </noscript>
</head>

<body>
    <script src="jquery-3.6.0.min.js"></script>
    <script src="svg.js"></script>
    <script src="general.js"></script>

    <nav>
        <table class="nav" style="background-color: transparent;">
            <tr class="nav">
                <th class="nav">
                    <a class="nav" href="3d/">😍 3D</a>
                </th>
                <th class="nav">
                    <a class="nav" href="projects/">Projects</a>
                </th>
                <th class="nav">
                    <a class="nav" href="tools/">Tools</a>
                </th>
            </tr>
        </table>
    </nav>

    <div id="nav-padding"></div>

    <header class="fillscreen">
        <div class="fillscreen-center">
            <h1 class="typewriter" float-depth="1.0" float-smooth>Hello, I'm DrDesten</h1>
            <h2 id="header-subtitle" class="header-subtitle" float-depth="0.5" float-smooth>check out my work</h2>
        </div>
    </header>

    <a href="https://www.github.com/DrDesten/" target="_blank" rel="noopener noreferrer"><img class="icon" src="icons/GitHub Mark.svg" alt="GitHub Mark" width="100" height="100"/></a>

    <div id="canvas" style="position: absolute;top:0;bottom:0;right:0;left:0;z-index:-1;"></div>

    <script src="style.js"></script>
    <script src="animation.js"></script>
    <script src="svgbackground.js"></script>

</body>

</html>`

console.log( inspect( parseXML( html ), false, Infinity, true ) )
console.log( parseXML( html ) )