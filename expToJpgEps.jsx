/**
 * ai.jsx (c)MaratShagiev m_js@bk.ru 06.04.2016
 *
 * compatible CS6+
 *
 * expToJpgEps_v0.9.6
 *
 * Processed only visible and unlocked items and layers
 *
 * 1. Export to jpeg (~15 Mpx)
 * 2. Scale 20%
 * 3. Save as EPS10
 */

(function expTo_JpgEps () {
  var /**
       * Change the scaling percentage of the EPS document
       * WARNING! Follow this string format : 'dd.d', where 'd' is the digital symbol
       * */
      scalePrcInAct    = '20.0',
      banch         = true,
      start         = new Date (),
      countIncreaseAct = 0;

  (function initCheck () {
    if (!documents.length) throw new Error ('No open documents.');
    if (!activeDocument.fullName.exists) throw new Error ("Document isn't save.");
  } ());

  try {

    var artbs = activeDocument.artboards;
    for (var k = 0; k < artbs.length; k++) {
      if (artbs.length == 1) break;
      artbs[k].remove();
      k--;
    }

    executeMenuCommand ('selectall');
    executeMenuCommand ('Fit Artboard to selected Art');
    expToJpg (activeDocument.fullName);

    executeMenuCommand ('selectall');
    doScaleAct (scalePrcInAct);

    executeMenuCommand ('selectall');
    executeMenuCommand ('Fit Artboard to selected Art');
   // saveAsEps (activeDocument.fullName);
    $.sleep(1000);
    doSaveAsEps ();
  } catch (e) {
    alert ('Error message:' + e + '\nerror line: ' + e.line);
    return;
  }

  banch == true ? $.writeln(activeDocument.name + ': ' + (new Date () - start) / 1000) + ' sec' : '';

  function saveAsEps (expFile) {
    var epsOpts                       = new EPSSaveOptions ();
    epsOpts.compatibility             = Compatibility.ILLUSTRATOR10;
    epsOpts.cmykPostScript            = false;
    epsOpts.embedLinkedFiles          = false;
    epsOpts.includeDocumentThumbnails = false;
    epsOpts.preview                   = EPSPreview.None;
    //epsOpts.flattenOutput             = OutputFlattening.PRESERVEPATHS; // PRESERVEAPPEARANCE // PRESERVEPATHS
    activeDocument.saveAs(expFile, epsOpts);
  }

  function expToJpg (expFile) {

    var AREA_PX       = 15e6,
        docH          = activeDocument.height,
        docW          = activeDocument.width,
        scalePctJpg   = Math.sqrt(AREA_PX / (docH * docW)) * 100,
        resForOpenPdf = Math.sqrt(AREA_PX / (docH / 72 * docW / 72));

    if (scalePctJpg > 776) {
      executeMenuCommand ('selectall');
      doScaleAct ('400.0');
      executeMenuCommand ('selectall');
      executeMenuCommand ('Fit Artboard to selected Art');
      countIncreaseAct++;
      expToJpg (expFile);
    } else {
      _nativeExpToJpg (scalePctJpg);
      for (var i = 0; i < countIncreaseAct; i++) {
        executeMenuCommand ('selectall');
        executeMenuCommand ('Fit Artboard to selected Art');
        doScaleAct ('25.0');
      }
    }

    function _nativeExpToJpg (scalePctJpg) {
      var jpgOpts    = new ExportOptionsJPEG (),
          docName    = activeDocument.name.replace(/\.[^\.]+$/, ''),
          docPath    = activeDocument.fullName.path,
          modDocName = docName.replace (/\s/g, "-"),
          modJpgFile = new File (docPath + '/' + modDocName + '.jpg'),
          jpgFile    = new File (docPath + '/' + docName + '.jpg');
// delete previous jpg-files
      jpgFile.exists ? jpgFile.remove () : '';
      modJpgFile.exists ? modJpgFile.remove () : '';
// export
      jpgOpts.artBoardClipping = true;
      jpgOpts.qualitySetting   = 100;
      jpgOpts.horizontalScale  = scalePctJpg;
      jpgOpts.verticalScale    = scalePctJpg;
      activeDocument.exportFile(expFile, ExportType.JPEG, jpgOpts);
// rename the modify jpg file
      modJpgFile.rename (docName + '.jpg');
    }
  }

  function doScaleAct (scalePctEps) {
    var actStr = '/version 3' +
      '/name [ 8' +
      '	7365745363616c65' +
      ']' +
      '/isOpen 1' +
      '/actionCount 1' +
      '/action-1 {' +
      '	/name [ 8' +
      '		6163745363616c65' +
      '	]' +
      '	/keyIndex 0' +
      '	/colorIndex 0' +
      '	/isOpen 1' +
      '	/eventCount 1' +
      '	/event-1 {' +
      '		/useRulersIn1stQuadrant 0' +
      '		/internalName (adobe_scale)' +
      '		/localizedName [ 5' +
      '			5363616c65' +
      '		]' +
      '		/isOpen 1' +
      '		/isOn 1' +
      '		/hasDialog 1' +
      '		/showDialog 0' +
      '		/parameterCount 5' +
      '		/parameter-1 {' +
      '			/key 1970169453' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-2 {' +
      '			/key 1818848869' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 1' +
      '		}' +
      '		/parameter-3 {' +
      '			/key 1752136302' +
      '			/showInPalette -1' +
      '			/type (unit real)' +
      '			/value ' + scalePctEps +
      '			/unit 592474723' +
      '		}' +
      '		/parameter-4 {' +
      '			/key 1987339116' +
      '			/showInPalette -1' +
      '			/type (unit real)' +
      '			/value ' + scalePctEps +
      '			/unit 592474723' +
      '		}' +
      '		/parameter-5 {' +
      '			/key 1668247673' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '	}' +
      '}'

    _makeAct (actStr);
    app.doScript("actScale", "setScale", false); // action name, set name
    app.unloadAction("setScale", ""); // set name

    function _makeAct (str) {
      var f = new File ('~/ScriptAction.aia');
      f.open('w');
      f.write(str);
      f.close();
      app.loadAction(f);
      f.remove();
    }
  }

  //todo: Illustrator crashes after save eps
  function doSaveAsEps () {

    var actStr = '/version 3' +
      '/name [ 9' +
      '	736176654173457073' // "saveAsEps"
      ']' +
      '/isOpen 1' +
      '/actionCount 1' +
      '/action-1 {' +
      '	/name [ 9' +
      '		736176654173457073' // "saveAsEps"
      '	]' +
      '	/keyIndex 0' +
      '	/colorIndex 0' +
      '	/isOpen 1' +
      '	/eventCount 1' +
      '	/event-1 {' +
      '		/useRulersIn1stQuadrant 0' +
      '		/internalName (adobe_saveDocumentAs)' +
      '		/localizedName [ 7' +
      '			53617665204173' +  // Save As
      '		]' +
      '		/isOpen 0' +
      '		/isOn 1' +
      '		/hasDialog 1' +
      '		/showDialog 0' +
      '		/parameterCount 18' +
      '		/parameter-1 {' +
      '			/key 2003201396' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 1' +
      '		}' +
      '		/parameter-2 {' +
      '			/key 1668445298' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 10' +
      '		}' +
      '		/parameter-3 {' +
      '			/key 1702392878' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 1' +
      '		}' +
      '		/parameter-4 {' +
      '			/key 1768975459' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-5 {' +
      '			/key 1769236589' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-6 {' +
      '			/key 1667723380' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-7 {' +
      '			/key 1768320372' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 0' +
      '		}' +
      '		/parameter-8 {' +
      '			/key 1768122987' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-9 {' +
      '			/key 1886612598' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 2' +
      '		}' +
      '		/parameter-10 {' +
      '			/key 1668118891' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-11 {' +
      '			/key 1684435811' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 1' +
      '		}' +
      '		/parameter-12 {' +
      '			/key 1701802100' +
      '			/showInPalette -1' +
      '			/type (integer)' +
      '			/value 1' +
      '		}' +
      '		/parameter-13 {' +
      '			/key 1851878757' +
      '			/showInPalette -1' +
      '			/type (ustring)' +
      '			/value [ ' + (_strToHexAncii ().length / 2) +
      '				' + _strToHexAncii () +  // eps full name
      '			]' +
      '		}' +
      '		/parameter-14 {' +
      '			/key 1718775156' +
      '			/showInPalette -1' +
      '			/type (ustring)' +
      '			/value [ 22' +
      '				41646f626520496c6c7573747261746f722045505346' +  // Adobe Illustrator EPSF
      '			]' +
      '		}' +
      '		/parameter-15 {' +
      '			/key 1702392942' +
      '			/showInPalette -1' +
      '			/type (ustring)' +
      '			/value [ 11' +
      '				6570732c657073662c7073' +  // eps,epsf,ps
      '			]' +
      '		}' +
      '		/parameter-16 {' +
      '			/key 1936548194' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 0' +
      '		}' +
      '		/parameter-17 {' +
      '			/key 1935764588' +
      '			/showInPalette -1' +
      '			/type (boolean)' +
      '			/value 1' +
      '		}' +
      '		/parameter-18 {' +
      '			/key 1936875886' +
      '			/showInPalette -1' +
      '			/type (ustring)' +
      '			/value [ 1' +
      '				31' +  // 1 artboards
      '			]' +
      '		}' +
      '	}' +
      '}'

    _makeAct (actStr);
    app.doScript(actName, setName, false); // action name, set name
    app.unloadAction(setName, ""); // set name

    function _makeAct (str) {
      var f = new File ('~/ScriptAction.aia');
      f.open('w');
      f.write(str);
      f.close();
      app.loadAction(f);
      f.remove();
    }

    function _hexAnciiToStr (str) {
      var tmpStr = '', result = '';
      for (var i = 0; i < str.length; i += 2) {
        tmpStr = str.slice(i, i + 2);
        result += String.fromCharCode (parseInt (tmpStr, 16));
      }
      return result;
    }

    function _strToHexAncii () {
      if (arguments.length == 0) {
        var str = (activeDocument.fullName.fsName).replace(/\.[^\.]+$/, '') + '.eps';
      } else {
        str = arguments[0];
      }
      var result      = '',
          currentChar = '';
      for (var i = 0; i < str.length; i++) {
        currentChar = str[i].charCodeAt(0).toString(16);
        result += currentChar;
      }
      return result;
    }
  }
} ());
