## Example Usage ##

```javascript
// create a new 3d renderer
var r = new X.renderer3D();
r.init();
    
// create a mesh from a .stl file
var brain = new X.mesh();
brain.file = 'brain.stl';
    
// add the object
r.add(brain);
    
// .. and render it
r.render();
```

## Development ##
To compile the code, type
```shell
cd utils/
./build.py
```
xtk.js will be generated. 

## License ##
Copyright (c) 2012 The X Toolkit Developers  \<dev@goXTK.com>

The X Toolkit (XTK) is licensed under the MIT License:
  <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">http://www.opensource.org/licenses/mit-license.php</a>

 
