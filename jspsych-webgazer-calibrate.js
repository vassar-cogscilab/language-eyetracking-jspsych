/**
 * jspsych-webgazer-calibrate
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["webgazer-calibrate"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'webgazer-calibrate',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    webgazer.setGazeListener(function(data, elapsedTime){
      if(data == null){
        return;
      }
      var x = data.x;
      var y = data.y;

      display_element.querySelector('#gaze-point').style.top = y;
      display_element.querySelector('#gaze-point').style.left = x;

      //console.log("x: "+x+", y: "+y+", t: "+elapsedTime);
    });

    webgazer.begin();

    var html = "<div id='webgazer-calibrate-bg' style='position: relative; width:100%; height:100%;'>"
    html+="<p>Calibrartion start.</p>"
    html+="<div id='gaze-point' style='position: absolute; width:20px; height:20px; background-color:red; border-radius:10px;'></div>"
    html+="</div>"

    display_element.innerHTML = html;


    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
