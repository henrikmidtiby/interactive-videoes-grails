# TekVideo Components

To test the system, do the following

1. enter the frontend directory
cd frontend

2. launch the development server
polymer serve

3. open the link in the browser
http://127.0.0.1:8081/components/tekvideo-frontend/tests.html

5. edit files and check whether it works in the browser.



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

