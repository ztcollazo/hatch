import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData } from "../../data/resume-schema";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#172033",
    lineHeight: 1.35,
  },
  name: { fontSize: 25, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  role: { fontSize: 12, color: "#3157d5", marginBottom: 5, marginTop: 12 },
  contact: { color: "#4b5563", marginBottom: 18 },
  section: { marginTop: 13 },
  heading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#3157d5",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#d9d5cb",
    paddingBottom: 3,
    marginBottom: 8,
  },
  entry: { marginBottom: 9 },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  subtitle: { fontFamily: "Helvetica-Bold", color: "#4b5563" },
  dates: { color: "#6b7280", fontSize: 9 },
  description: { marginTop: 3 },
  bullet: { marginTop: 2, paddingLeft: 10 },
  link: { color: "#3157d5", textDecoration: "none" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
  },
});

export function ResumeDocument({ data }: { data: ResumeData }) {
  return (
    <Document
      title={`${data.fullName || "Resume"} Resume`}
      author={data.fullName || "profile"}
    >
      <Page size="LETTER" style={styles.page} wrap>
        <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
        {(data.targetRole || data.headline) && (
          <Text style={styles.role}>
            {[data.targetRole, data.headline].filter(Boolean).join(" · ")}
          </Text>
        )}
        {data.bio && <Text>{data.bio}</Text>}
        {data.sections.map(
          (section) =>
            section.title !== "Skills" && (
              <View key={section.title} style={styles.section} wrap>
                <Text style={styles.heading}>{section.title}</Text>
                {section.entries.map((entry, index) => (
                  <View
                    key={`${entry.title}-${index}`}
                    style={styles.entry}
                    wrap={false}
                  >
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    {entry.subtitle && (
                      <Text style={styles.subtitle}>{entry.subtitle}</Text>
                    )}
                    {entry.dates && (
                      <Text style={styles.dates}>{entry.dates}</Text>
                    )}
                    {entry.description && (
                      <Text style={styles.description}>
                        {entry.description}
                      </Text>
                    )}
                    {section.title !== "Skills" &&
                      entry.bullets.map((bullet, bulletIndex) => (
                        <Text
                          style={styles.bullet}
                          key={`${bulletIndex}-${bullet}`}
                        >
                          • {bullet}
                        </Text>
                      ))}
                    {entry.url && (
                      <Link src={entry.url} style={styles.link}>
                        {entry.url}
                      </Link>
                    )}
                  </View>
                ))}
              </View>
            ),
        )}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
