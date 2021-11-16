import {AudioTrack, MasterTrack, AbletonProject} from './abletonProject';

export default class AbletonParser { 

    public static parse(xmlData: string): AbletonProject {
        var parseString = require('xml2js').parseString;
        var abletonAudioTrack = new AudioTrack();
        var abletonMasterTrack = new MasterTrack();
        var abletonProject = new AbletonProject(abletonAudioTrack, abletonMasterTrack);

        parseString(xmlData, function (err: any, result: any) {
            abletonProject.creator = result.Ableton.$.Creator;
            var numOfTracks = result.Ableton.LiveSet[0].Tracks[0].AudioTrack.length;

            

            for (let i = 0; i < numOfTracks; i++) {

                console.log(result.Ableton.LiveSet[0].Tracks[0].AudioTrack[i]);
                var audioTrack = result.Ableton.LiveSet[0].Tracks[0].AudioTrack[i].DeviceChain[0].MainSequencer[0].Sample[0].ArrangerAutomation[0].Events[0].AudioClip;
                var trackList = Array<string>();

                audioTrack?.forEach(function (item: any, index: any) {
                    trackList.push("[ID: " + item.$.Id + " Duration: " + item.CurrentStart[0].$.Value + " - " + item.CurrentEnd[0].$.Value + "] " + item.Name[0].$.Value);
                });

                abletonAudioTrack.addTrackList(i + 1 + ".", trackList);
            }

            var bpmEnvelopes = result.Ableton.LiveSet[0].MasterTrack[0].AutomationEnvelopes[0].Envelopes[0].AutomationEnvelope;

            for (let i = 0; i < bpmEnvelopes.length; i++) {
                var automationEnvelope = bpmEnvelopes[i];
                if (automationEnvelope.EnvelopeTarget[0].PointeeId[0].$.Value === "8") {
                    var floatEvents = automationEnvelope.Automation[0].Events[0].FloatEvent;
                    console.log(floatEvents.length);                    
                    for (let e = 0; e < floatEvents.length; e++) {
                        abletonMasterTrack.addToBpmEnvelope(floatEvents[e].$.Time, floatEvents[e].$.Value);
                    }
                }

            }

        });

        return abletonProject;
    }
 }