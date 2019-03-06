# TekVideo Components

To test the system, do the following

1. enter the frontend directory
cd frontend

2. launch a web server
python3 -m http.server

3. execute 'polymer build'
polymer build

4. open the file exercises.html in the browser
http://0.0.0.0:8000/exercises.html

5. after editing files, rerun 'polymer build'



# Known issues

When editing exercises with matrix as an answer type. The values 
of the result matrix disappears when the json is loaded into 
the exercise editor. I don't think that the value is sent to the 
matrix-renderer in the first place.
Actually the value is sent, but probably not used for anything.
The value is set using the following loop in tv-exercise-editor.js
          for (var property in widget.properties) {
              var value = widget.properties[property];
              editor[property] = value;
          }
But for some unknown ready, the widget is not updated to reflect on the content.

