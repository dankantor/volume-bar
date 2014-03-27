(function(){

if(typeof module !== "undefined"){
    var storage = require('local-storage-json');
}
else{
    console.error('local-storage-json module must exist');
}

function VolumeBar(opts){ 
    this.back = opts.back || null;
    this.thumb = opts.thumb || null;
    this.speaker = opts.speaker || null;
    this.speakerOnClass = opts.speakerOnClass || "on";
    this.speakerOffClass = opts.speakerOffClass || "off";
    this.audio =  opts.audio || null;
    this.useLocalStorage = opts.useLocalStorage || false;
    this.localStorageNS = opts.localStorageNS ||'audioVolumeControl';
    this.settingTimeout = null;
    this.manualSet = true;
    this.addListeners();
    this.onWindowResize();
    this.initLocalStorage();
}

// add event listeners
VolumeBar.prototype.addListeners = function(){
    if(this.back){
        $(this.back).on(
            'click',
            this.onBackClick.bind(this)
        );
    }
    if(this.thumb){
        $(this.thumb).on(
            'mousedown',
            this.onMouseDown.bind(this)
        );
        $(this.thumb).on(
            'mouseup', 
            this.onMouseUp.bind(this)
        );
    }
    if(this.speaker){
        $(this.speaker).on(
            'click',
            this.onSpeakerClick.bind(this)
        );
    }
    $(window).on(
        'resize',
        this.onWindowResize.bind(this)
    );
}

// calculate widths
VolumeBar.prototype.onWindowResize = function(){
    this.thumbWidth = 0;
    if(this.thumb){
        this.thumbWidth = $(this.thumb).width();
    }
    if(this.back){
        this.width = $(this.back).width() - this.thumbWidth / 2;
        this.left = $(this.back).offset().left + this.thumbWidth / 2;
        this.right = this.left + this.width;
    }
}

// mouseDown on thumb listener
VolumeBar.prototype.onMouseDown = function(e){
    this.bindedMouseMove = this.onMouseMove.bind(this);
    this.bindedMouseUp = this.onMouseUp.bind(this);
    $(document).on(
        'mousemove',
        this.bindedMouseMove
    );
    $(document).on(
        'mouseup', 
        this.bindedMouseUp
    );
    e.preventDefault();
}

// mouseMove on thumb listener
VolumeBar.prototype.onMouseMove = function(e){
    var x = e.clientX;
    if (x < this.left){
        x = this.left;
    }
    if (x > this.right){
        x = this.right;
    }
    this.thumbLeft = x - this.left;
    this.value = this.thumbLeft / this.width;
    this.set();
}

// mouseUp on thumb listener
VolumeBar.prototype.onMouseUp = function(e){
    $(document).off(
        'mousemove',
        this.bindedMouseMove
    );
    $(document).off(
        'mouseup',
        this.bindedMouseUp
    );
}

// click on back listener
VolumeBar.prototype.onBackClick = function(e){
    this.onMouseMove(e);
    this.value = this.thumbLeft / this.width;
}

// click on speaker listener
VolumeBar.prototype.onSpeakerClick = function(e){
    if ($(this.speaker).hasClass(this.speakerOnClass)){
        this.onMouseMove(
            {
                'clientX': 0
            }
        );
    }
    else{
        this.onMouseMove(
            {
                'clientX': 1000
            }
        );
    }
}

// update display
// optionally update audio volume
// fire 'change' event
// don't allow manual setting for 1 sec
VolumeBar.prototype.set = function(){
    this.manualSet = false;
    clearTimeout(this.settingTimeout);
    this.updateDisplay();
    if(this.audio){
        this.audio.volume = this.value;
    }
    $(this.back).trigger(
        {
            'type': 'change', 
            'value': this.value
        }
    );
    if(this.useLocalStorage === true){
        storage.set(
            this.localStorageNS + '_volume',
            this.value
        );
    }
    this.settingTimeout = setTimeout(
        function(){
            this.manualSet = true;
        }.bind(this),
        1000
    );
}

// move the thumb and set speaker class
VolumeBar.prototype.updateDisplay = function(){
    $(this.thumb).css('left', this.thumbLeft);
    if (this.value <= 0){
        this.value = 0;
        $(this.speaker).removeClass(this.speakerOnClass);
        $(this.speaker).addClass(this.speakerOffClass);
    } else {
        $(this.speaker).removeClass(this.speakerOffClass);
        $(this.speaker).addClass(this.speakerOnClass);
    }
    if (this.value >= 1){
        this.value = 1;
    }
}

// give a volume to set the thumb position
// cannot be set if 'manualSet' var is false
// to avoid infinite loop
VolumeBar.prototype.setManual = function(value){
    if(this.manualSet === true){
        this.value = value;
        this.thumbLeft = this.value * this.width;
        this.updateDisplay();
    }
}

// if localStoarge is enabled
// set volume and display to 
// value in localStorage
VolumeBar.prototype.initLocalStorage = function(){
    if(this.useLocalStorage === true){
        var value = storage.get(this.localStorageNS + '_volume');
        if(value !== null){
            if(this.audio){
                this.audio.volume = value;
                this.setManual(value);
            }
        }
    }
}


// check if we've got require
if(typeof module !== "undefined"){
    module.exports = VolumeBar;
}
else{
    window.VolumeBar = VolumeBar;
}

}()); // end wrapper



