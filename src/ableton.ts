export default class Ableton { 

    creator?: string;
    trackList? : Array<string>;
 
    addTrack(title: string): void {
        this.trackList?.push(title);
    }

    tracksToHtmlList(): string {
        var result = "";
        this.trackList?.forEach(element => {
            result += "<li>" + element + "</li>";
        });

        return result;
    }
 }