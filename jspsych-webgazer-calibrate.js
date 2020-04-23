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
      face_detect_threshold: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Face Detection Threshold',
        default: 0.75,
        description: 'A value between 0-1 representing the quality of the face detection that must be achieved before moving to calibration.'
      },
      calibration_points: {
        type: jsPsych.plugins.parameterType.INT,
        default: [[10,50], [10,90], [30,10], [50,10], [50,50], [50,90], [90,10], [90,50], [90,90]]
      }
    }
  }

  // provide options for calibration routines?
  // dot clicks?
  // track a dot with mouse?
  
  // then a validation phase of staring at the dot in different locations?

  plugin.trial = function(display_element, trial) {

    webgazer.begin();

    var html = "<div id='webgazer-calibrate-container' style='position: relative; width:100vw; height:100vh'>"
    html+="</div>"

    display_element.innerHTML = html;

    var wg_container = display_element.querySelector('#webgazer-calibrate-container');

    var state = "video-detect";

    // run the main loop through calibration routine /////////
    function loop(){
      if(state == 'video-detect'){
        show_video_detect_message();
        var score = check_face_score();
        wg_container.querySelector('#video-detect-quality-inner').style.width = (score*100) + "%"
        if(score > trial.face_detect_threshold){
          state = "begin-calibrate";
        }
        requestAnimationFrame(loop);
      } else if(state == 'begin-calibrate'){
        show_begin_calibrate_message();
      } else if(state == 'calibrate'){
        calibrate();
      } else if(state == 'calibration-done'){
        wg_container.innerHTML = "";
        webgazer.showPredictionPoints(true);
      }
    }

    requestAnimationFrame(loop);

    function show_video_detect_message(){
      wg_container.innerHTML = "<div style='position: absolute; top: 50%; left: calc(50% - 350px); transform: translateY(-50%); width:700px;'>"+
        "<p>To start, you need to position your head so that the webcam has a good view of your eyes.</p>"+
        "<p>Use the video in the upper-left corner as a guide. Center your face in the box.</p>"+
        "<p>Quality of detection:</p>"+
        "<div id='video-detect-quality-container' style='width:700px; height: 20px; background-color:#ccc; position: relative;'>"+
        "<div id='video-detect-quality-inner' style='width:0%; height:20px; background-color: #5c5;'></div>"+
        "<div id='video-detect-threshold' style='width: 1px; height: 20px; background-color: #f00; position: absolute; top:0; left:"+(trial.face_detect_threshold*100)+"%;'></div>"+
        "</div>"+
        "</div>"
    }

    function check_face_score(){
      return webgazer.getTracker().clm.getScore();
    }

    function show_begin_calibrate_message(){
      wg_container.innerHTML = "<div style='position: absolute; top: 50%; left: calc(50% - 350px); transform: translateY(-50%); width:700px;'>"+
        "<p>Great! Now the eye tracker will be calibrated to translate the image of your eyes from the webcam to a location on your screen.</p>"+
        "<p>To do this, you need to look at a series of dots and click on them with your mouse. Make sure to look where you are clicking. Each click teaches the eye tracker how to map the image of your eyes onto a location on the page.</p>"+
        "<p>Please click each point 5 times.</p>"+
        "<button id='begin-calibrate-btn' class='jspsych-btn'>Click to begin.</button>"+
        "</div>"
      document.querySelector('#begin-calibrate-btn').addEventListener('click', function(){
        state = 'calibrate';
        requestAnimationFrame(loop);
      });
    }

    var points_completed = 0;
    function calibrate(){
      points_completed = 0;
      next_calibration_point();
    }

    var clicks = 0;
    function next_calibration_point(){
      clicks = 0;
      var pt = trial.calibration_points[points_completed];
      var pt_html = '<div id="calibration-point" style="width:20px; height:20px; border-radius:10px; border: 2px solid #555; background-color: #ddd; position: absolute; left:'+pt[0]+'%; top:'+pt[1]+'%;"></div>'
      wg_container.innerHTML = pt_html;
      wg_container.querySelector('#calibration-point').addEventListener('click', function(){
        clicks++;
        wg_container.querySelector('#calibration-point').style.filter = "brightness("+(100 + clicks*10)+"%)"
        if(clicks >= 5){
          points_completed++;
          if(points_completed < trial.calibration_points.length){
            next_calibration_point();
          } else {
            state = 'calibration-done'
            requestAnimationFrame(loop);
          }
        }
      });

    }


    //requestAnimationFrame(update_gp);


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
