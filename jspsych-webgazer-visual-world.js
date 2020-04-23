/**
 * jspsych-webgazer-visual-world
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["webgazer-visual-world"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('webgazer-visual-world', 'audio', 'audio');

  plugin.info = {
    name: 'webgazer-visual-world',
    description: '',
    parameters: {
      audio: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Audio Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var gaze_data = [];
    var audio_start = null;

    // setup eye tracking callback
    webgazer.setGazeListener(function(data){
      if(data == null){
        return;
      }

      gaze_data.push({
        x: data.x - document.querySelector('#visual-world-target').offsetLeft,
        y: data.y - document.querySelector('#visual-world-target').offsetTop,
        t: performance.now() - audio_start
      })
    })

    // setup audio stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.audio);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.audio);
      audio.currentTime = 0;
    }

    // set up end event if trial needs it
    if(context !== null){
      source.onended = function() {
        end_trial();
      }
    } else {
      audio.addEventListener('ended', end_trial);
    }
    
    // show visual scene
    display_element.innerHTML = "<img id='visual-world-target' src='"+trial.image+"'>";
    

    // function to end trial when it is time
    function end_trial() {

      webgazer.pause();
      webgazer.clearGazeListener();

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      var trial_data = {
        "gaze_data": JSON.stringify(gaze_data)
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start audio
    if(context !== null){
      startTime = context.currentTime;
      source.start(startTime);
    } else {
      audio.play();
    }
    audio_start = performance.now();
    
    webgazer.resume();

  };

  return plugin;
})();
