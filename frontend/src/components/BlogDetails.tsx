import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Button } from "react-native";

const BlogDetails = ({ route, navigation }) => {
  const { blogId, blogs } = route.params;
  const blog = blogs.find((b) => b.id === parseInt(blogId, 10));

  if (!blog) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Blog not found 😔</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{blog.title}</Text>
      <Image source={{ uri: blog.image }} style={styles.image} />
      <Text style={styles.content}>{blog.content}</Text>
      <Button title="Back to Blogs" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
});

export default BlogDetails;
