import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Link } from "@react-pdf/renderer";

Font.register({
  family: "Open Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf", fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Open Sans",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1a1a1a"
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 8
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4
  },
  contact: {
    fontSize: 9,
    color: "#444",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4
  },
  section: {
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottom: "1px solid #999",
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 1
  },
  entry: {
    marginBottom: 6
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 2
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 700
  },
  entryPeriod: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic"
  },
  entryCompany: {
    fontSize: 9.5,
    color: "#444",
    marginBottom: 2
  },
  gpa: {
    fontSize: 9,
    color: "#555"
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2
  },
  bulletPoint: {
    width: 10,
    fontSize: 10
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#2a2a2a"
  },
  link: {
    color: "#1a4a8a",
    textDecoration: "underline"
  },
  projectLink: {
    fontSize: 8,
    color: "#1a4a8a",
    marginLeft: 6
  },
  summary: {
    fontSize: 9.5,
    color: "#2a2a2a",
    marginBottom: 4
  }
});

// Reuse the interface from the main file
export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  summary: string;
  education?: {
    institution: string;
    degree: string;
    period: string;
    gpa?: string;
  }[];
  skills: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    bullets: string[];
    links?: { github?: string | null; live?: string | null; kaggle?: string | null };
  }[];
}

export const ResumePDFDocument = ({ data }: { data: ResumeData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <View style={styles.contact}>
            {data.phone && <Text>{data.phone} • </Text>}
            <Text>{data.email} • </Text>
            {data.github && <Link style={styles.link} src={`https://${data.github}`}>{data.github}</Link>}
            {data.linkedin && <Text> • </Text>}
            {data.linkedin && <Link style={styles.link} src={`https://${data.linkedin}`}>LinkedIn</Link>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryPeriod}>{edu.period}</Text>
                </View>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryCompany}>{edu.degree}</Text>
                  {edu.gpa && <Text style={styles.gpa}>{edu.gpa}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <Text style={styles.summary}>{data.skills.join(" • ")}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.role}</Text>
                  <Text style={styles.entryPeriod}>{exp.period}</Text>
                </View>
                <Text style={styles.entryCompany}>{exp.company}</Text>
                {exp.bullets.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj, i) => {
              const linkEntries = proj.links ? Object.entries(proj.links).filter(([, v]) => v) : [];
              return (
                <View key={i} style={styles.entry}>
                  <View style={[styles.entryHeader, { justifyContent: "flex-start", alignItems: "center" }]}>
                    <Text style={styles.entryTitle}>{proj.title}</Text>
                    {linkEntries.map(([label, url]) => (
                      <Link key={label} style={styles.projectLink} src={url!}>[{label}]</Link>
                    ))}
                  </View>
                  {proj.bullets.map((b, j) => (
                    <View key={j} style={styles.bulletRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
};
