import { describe, it, expect } from "vitest";
import {
  parseVinkData,
  parseGetData2Format,
  buildFormBody,
  MOCK_VINK_RESPONSE,
} from "./useLiveLapsData";

describe("parseVinkData", () => {
  it("parses JSON array", () => {
    const result = parseVinkData(MOCK_VINK_RESPONSE);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      lap: 1,
      time: "42.3",
      venue: "Binnen",
      date: "2025-01-15",
    });
    expect(result[1].time).toBe("41.8");
    expect(result[2].venue).toBe("Buiten");
  });

  it("parses JSON object with laps key", () => {
    const raw = `{"laps":[{"lap":1,"time":"40.0","venue":"Binnen","date":"2025-01-01"}]}`;
    const result = parseVinkData(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      lap: 1,
      time: "40.0",
      venue: "Binnen",
      date: "2025-01-01",
    });
  });

  it("parses CSV with headers", () => {
    const raw = `lap,time,venue,date
1,42.3,Binnen,2025-01-15
2,41.8,Buiten,2025-01-15`;
    const result = parseVinkData(raw);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      lap: 1,
      time: "42.3",
      venue: "Binnen",
      date: "2025-01-15",
    });
  });

  it("parses TSV", () => {
    const raw = `lap\ttijd\tbaan\tdatum
1\t42.3\tBinnen\t2025-01-15`;
    const result = parseVinkData(raw);
    expect(result).toHaveLength(1);
    expect(result[0].lap).toBe(1);
    expect(result[0].time).toBe("42.3");
  });

  it("returns empty array for empty input", () => {
    expect(parseVinkData("")).toEqual([]);
    expect(parseVinkData("   ")).toEqual([]);
  });

  it("parses getData2.php semicolon format", () => {
    const raw = `;2024-10-12;10:03:58;00:00.000;2838 ;2024-10-12;10:03:58;05:19.443;2838 ;2024-10-12;10:09:18;01:10.356;2838`;
    const result = parseVinkData(raw);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      lap: 1,
      time: "00:00.000",
      venue: "IJsbaan 2838",
      date: "2024-10-12",
    });
    expect(result[1].time).toBe("05:19.443");
    expect(result[2].time).toBe("01:10.356");
  });

  it("parseGetData2Format handles empty", () => {
    expect(parseGetData2Format("")).toEqual([]);
  });

  it("handles lap_num and lap_time aliases", () => {
    const raw = `[{"lap_num":5,"lap_time":"39.5","baan":"Gemengd","datum":"2025-02-01"}]`;
    const result = parseVinkData(raw);
    expect(result[0]).toEqual({
      lap: 5,
      time: "39.5",
      venue: "Gemengd",
      date: "2025-02-01",
    });
  });
});

describe("buildFormBody", () => {
  it("uses defaults", () => {
    const body = buildFormBody({});
    expect(body).toContain("Transp=FZ-62579");
    expect(body).toContain("Filter=ALLEMAAL");
    expect(body).toContain("MinLaps=0");
    expect(body).toContain("MaxLaps=1000");
  });

  it("uses custom params", () => {
    const body = buildFormBody({
      transponder: "AB-12345",
      filter: "BESTE",
    });
    expect(body).toContain("Transp=AB-12345");
    expect(body).toContain("Filter=BESTE");
    expect(body).toContain("MinLaps=0");
    expect(body).toContain("MaxLaps=1000");
  });
});
