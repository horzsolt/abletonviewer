import Ableton from './ableton';

export default class AbletonParser { 

    public static parse(xmlData: string): Ableton {
        var parseString = require('xml2js').parseString;
        var ableton = new Ableton();

        parseString(xmlData, function (err: any, result: any) {
            ableton.creator = result.Ableton.$.Creator;
            var firstAudioTrack = result.Ableton.LiveSet[0].Tracks[0].AudioTrack[0].DeviceChain[0].MainSequencer[0].Sample[0].ArrangerAutomation[0].Events[0].AudioClip;

            firstAudioTrack.forEach(function (element: any) {
                ableton.addTrack(element);
            });
            console.log("first audio track: ");            
            console.log(firstAudioTrack);
        });

        return ableton;
    }
 }