var HUtil = {
	isMobile: function(){
        if( navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/) )
                return true;
        return false;
    },
    // emulate mouse events with touch
    touchHandler: function(e)
    {        
        var event = e.originalEvent;
        // Ignore multi-touch events
        if (event.touches.length > 1) {
          return;
        }
        
        var touches = event.changedTouches,
        first = touches[0],
        type = "";
    
        var d = new Date();
        switch(event.type)
        {
            case "touchstart":
               
                type = "mousedown";
                break;
            case "touchmove":
                
                type="mousemove";
                break;        
            case "touchend":
    
                type="mouseup";
                break;
            default:
                return;
        }
        
        var simulatedEvent = document.createEvent("MouseEvents");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
                          first.screenX, first.screenY,
                          first.clientX, first.clientY, false,
                          false, false, false, 0/*left*/, null);
        
        first.target.dispatchEvent(simulatedEvent);
        
        e.preventDefault(); 
                
       
        
    },
    initTouchEvents: function(element){
        
        element.live('touchstart', this.touchHandler);
        element.live('touchmove', this.touchHandler);
        element.live('touchend', this.touchHandler);
        element.live('touchcancel', this.touchHandler);
         
    }

	
};