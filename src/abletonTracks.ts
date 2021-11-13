export default class AbletonTracks { 

    creator: string = '';
    tracks : Map<string, string[]> = new Map<string, string[]>();
 
    constructor() {

    }

    addTrackList(trackNum: string, trackTitles: string[]): void {
        this.tracks.set(trackNum, trackTitles);
    }

    tracksToHtmlList(): string {
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

        console.log(result);
        return result;
    }
 }