import { time } from "console";

export class AbletonProject {
    
    audioTrack: AudioTrack;
    masterTrack: MasterTrack;
    creator: string = '';    

    constructor(audioTrack: AudioTrack, masterTrack: MasterTrack) {
        this.audioTrack = audioTrack;
        this.masterTrack = masterTrack;
    }
}

export class AudioTrack { 

    tracks : Map<string, string[]> = new Map<string, string[]>();
 
    constructor() {

    }

    addTrackList(trackNum: string, trackTitles: string[]): void {
        this.tracks.set(trackNum, trackTitles);
    }

    toHtmlList(): string {
        var result = "";

        this.tracks.forEach((value: string[], key: string) => {
            result += "<li><span class='caret'>" + key + " track:</span>";
            result += "<ul class='nested'>";

            value.forEach(element => {
                result += "<li>" + element + "</li>";
            });

            result += "</ul>";
            result += "</li>";
        });

        return result;
    }
 }

export class MasterTrack { 

    creator: string = '';
    bpmEnvelopes : Map<number, number> = new Map<number, number>();
 
    constructor() {

    }

    addToBpmEnvelope(time: number, bpm: number): void {
        if (time == -63072000) {
            time = 0;
        }
        this.bpmEnvelopes.set(time, bpm);
    }

    toHtmlList(): string {
        var result = "";

        result += "<li><span class='caret'>Mastertrack:</span>";
        result += "<ul class='nested'>";

        this.bpmEnvelopes.forEach((value: number, key: number) => {
            result += "<li>Time: " + key.toString()+ " BPM: " + value.toString() + "</li>";
        });

        result += "</ul>";
        result += "</li>";

        console.log(result);
        return result;
    }
 }