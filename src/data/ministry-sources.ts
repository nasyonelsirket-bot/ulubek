import type { MockSource, SourceType, SourceKind } from "@/data/types";

export interface ExtendedSource extends MockSource {
  kind: SourceKind;
}

export const MINISTRY_SOURCES: Omit<ExtendedSource, "id" | "lastFetchedAt">[] = [
  {
    name: "T.C. İletişim Başkanlığı",
    url: "https://www.iletisim.gov.tr/rss",
    type: "RSS" as SourceType,
    kind: "MINISTRY",
    isActive: true,
    trustScore: 0.98,
    categoryId: "1",
    fetchIntervalMin: 1,
  },
  {
    name: "T.C. Sağlık Bakanlığı",
    url: "https://www.saglik.gov.tr/rss",
    type: "RSS" as SourceType,
    kind: "MINISTRY",
    isActive: true,
    trustScore: 0.97,
    categoryId: "5",
    fetchIntervalMin: 1,
  },
  {
    name: "T.C. Hazine ve Maliye Bakanlığı",
    url: "https://www.hmb.gov.tr/rss",
    type: "RSS" as SourceType,
    kind: "MINISTRY",
    isActive: true,
    trustScore: 0.96,
    categoryId: "2",
    fetchIntervalMin: 1,
  },
];
