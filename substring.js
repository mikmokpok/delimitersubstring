(function() {
    
  if (!window.JFWidgetSubstrSetup)
  window.JFWidgetSubstrSetup = function(params) {

    // a fixed when old and new widget mixed up
    this.served = (typeof this.served !== 'undefined') ? this.served : [];

    // ignore existing qids
    if (!!~this.served.indexOf(params.qid)) {
      return false;
    } else {
      this.served.push(params.qid);
    }
    
    /**
     * Detect if mobile platform
     */
    var isMobile = function() {
      var ua = navigator.userAgent.toLowerCase();
      return (/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) ||
        (/ipad|android 3|sch-i800|playbook|tablet|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk/i.test(ua)) ||
        (ua.indexOf('macintosh') > -1 && navigator.maxTouchPoints > 1);
    }();

    function SubString(params) {
      var inputId = 'input_' + params.qid;

      // exposed methods
      this.init = init;

      function init() {
        // create container
        var srcField = $(getSrcFieldID());
        if (!srcField) {
          var err = new Element('p').setStyle('color', '#F00').update('Invalid source field ID');
          $(inputId + '_container').insert(err);
          return;
        }

        var label = new Element('label',{
          for: inputId,
          id: "label_"+inputId,
          style: "display:block; margin-bottom:15px;"

        }).update(params.fLabel);
        
        var input = new Element('input', {
          type: 'text',
          id: inputId,
          name: params.qname,
          readonly: 'readonly',
          className: 'form-textbox substring'
        }).setStyle({
          'box-sizing': 'border-box',
        });
        $(inputId + '_container').insert(label);
        $(inputId + '_container').insert(input);

        var subString_elem = $$('.substring#' + inputId).first();
        var subString_parent_width = subString_elem.parentNode.parentNode.style.width;
        subString_elem.setStyle({ width: subString_parent_width });
        subString_elem.up('div[id*="cid"]').setStyle({display: 'inline-block'});
        addChangeListener(srcField);

        // when widget loaded run condition for other widgets
        setTimeout(function() {
          JotForm.runConditionForId(params.qid);
        }, 50);

        var hasPrepopulation = srcField && srcField.id && srcField.id in JotForm.defaultValues;
        // get values and update the widget's value if edit mode or it has prepopulations
        if (JotForm.isEditMode() || hasPrepopulation) {
          setTimeout(function() {
            if (srcField.value) {
              updateSubstringValue();  
            }
          }, 1000);
        }
      }

      function getSrcFieldID() {
        return params.source.replace(/^#/i, '');
      }

      function addChangeListener(el) {
        var id = getCleanID(el.id);
        var type = JotForm.getInputType(id);
        var elem = $('id_' + id);

        switch (type) {
          case 'radio':
          case 'checkbox':
          case 'signature':
            setListener(elem, 'click');
            break;

          case 'select':
            setListener(elem, 'change');
            break;

          case 'file':
            setListener(elem, 'change');
            if ($$('#id_' + id + ' input').first().readAttribute('multiple') === 'multiple') {
              setListener(elem, 'click', true);
            }
            break;

          case 'datetime':
            setListener(elem, 'date:changed');
            $$("#id_" + id + ' select').each(function(el) {
              setListener($(el), 'change');
            });
            break;

          case 'time':
          case 'birthdate':
            $$("#id_" + id + ' select').each(function(el) {
              setListener($(el), 'change');
            });
            break;

          case 'address':
          case 'email':
            setListener(elem, 'keyup');
            setListener(elem, 'change');
            break;

          case 'number':
            setListener(elem, 'keyup');
            setListener(elem, 'click');
            setListener(elem, 'change');
            break;
            
          case 'text':
            if ($('input_' + id).readAttribute('data-masked') && isMobile) {
              setListener(elem, 'keyup', true);
            } else {
              setListener(elem, 'keyup');
              setListener(elem, 'change');
            }
            break;

          case "widget":
            setListener($('input_' + id), 'change');
            JotForm.widgetsWithConditions.push(id);
            break;

          default:
            setListener(elem, 'keyup');
            setListener(elem, 'change');
            break;
        }
      }

      function setListener(el, ev, wait) {
        elEvent = ev;
        if (wait) {
          $(el).observe(ev, function() {
            setTimeout(updateSubstringValue, 1000);
          });
        } else {
          setTimeout(function() {
            $(el).observe(ev, updateSubstringValue);
          }, 50);
        }
      }

      function updateSubstringValue() {
        var srcField = document.getElementById('input_' + getCleanID(getSrcFieldID())) || $(getSrcFieldID());
        // The widget can't get the value of the source after filling it out if the field is required and it has validation error. Now it fixed for input boxes.
        var value = (srcField != null) ? srcField.value : (JotForm.fieldHasContent(getCleanID(getSrcFieldID())) || '');
        // The Main Course
        var substr = value.split(params.delimiter)[params.strNum-1];
        $(inputId).setValue(substr);

        var el = document.getElementById(inputId);
        // trigger change event for Form calculation 
        el.triggerEvent('change');

        // run conditions
        JotForm.runConditionForId(params.qid);
      }

      function getCleanID(id) {
        id = id.split('_');
        return (id.length ? id[1] : '');
      }
    }

    // create the widget container before the dom fully loads
    document.write('<div id="input_' + params.qid + '_container"></div>');

    // observe dom:loaded event
    document.observe('dom:loaded', function() {
      var widget = new SubString(params);
      widget.init();
    });
  }

  // for old widgets just assign the right params if empty
  if (
    typeof window.srcFieldId !== 'undefined' &&
    typeof window.substringStart !== 'undefined' &&
    typeof window.substringEnd !== 'undefined' &&
    typeof window.substringQid !== 'undefined' &&
    typeof window.substringQname !== 'undefined'
  ) {
    window.JFWidgetSubstrSetup({
      source: window.srcFieldId,
      delimiter: window.delimiter,
      strNum: window.strNum,
      qid: window.substringQid,
      qname: window.substringQname,
      fLabel: window.fLabel
    });
  }

})();