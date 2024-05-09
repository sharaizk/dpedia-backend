const express = require("express");
const elasticSearch = require("@elastic/elasticsearch");
const { catchAsync } = require("../controller/errorController");
const Category = require("../models/category.model");
const esClient = new elasticSearch.Client({
  node: process.env.ESCLIENTHOST,
  auth: {
    username: process.env.ESCLIENTUSERNAME,
    password: process.env.ESCLIENTPASSWORD,
  },
});

// exports.elasticSearchClient = Client;

// exports.createMapping = async (indexName, properties) => {
//   await Client.indices.create({
//     index: indexName,
//     body: {
//       mappings: {
//         properties
//       }
//     }
//   }, { ignore: [400] })
// }

// exports.createIndex = async (indexName, objectToIndex) => {
//   console.log('creating index')
//   // create the index in the backend
//   const { response } = await Client.create({
//     index: indexName,
//     id: objectToIndex._id,
//     body: objectToIndex.body
//   })
//   console.log('Done creating the index: ', response);
// }

// exports.pingElasticClient = _ => {
//   client.ping({
//     requestTimeout: 30000,
//   }, function (error) {
//     if (error) {
//       console.error('elasticsearch cluster is down!');
//     } else {
//       console.log('All is well');
//     }
//   });
// }

// exports.updateIndex = async (indexName, objectToUpdate) => {

//   const { response } = await Client.update({
//     index: indexName,
//     id: objectToUpdate._id,
//     body: {
//       doc: objectToUpdate.doc
//     }
//   })

//   console.log('Done Updating the document: ', response);
// }

exports.searchIndex = async (
  indexName,
  searchType,
  search,
  from,
  size,
  isRelated = false
) => {
  const query = isRelated
    ? {
        multi_match: {
          query: search,
          fields: ["question"],
          type: "most_fields",
        },
      }
    : {
        match_phrase: {
          [searchType]: search,
        },
      };
  try {
    const response = await esClient.search({
      index: indexName,
      from: from,
      size: size,
      body: {
        query: query,
      },
    });

    const result = await Promise.all(
      response.body.hits.hits.map(async (hit) => {
        return {
          category: hit["_source"].category,
          title: hit["_source"].title,
          slug: hit["_source"].slug,
          question: hit["_source"].question,
          bookslug: hit["_source"]?.book?.slug,
        };
      })
    );
    return {
      data: result,
      totalSolutions: response.body.hits.total.value,
    };
  } catch (error) {
    return error;
  }
};

exports.getAllFromIndex = async (indexName, from, size) => {
  try {
    const response = await esClient.search({
      index: indexName,
      from: from,
      size: size,
      body: {
        query: {
          match_all: {},
        },
      },
    });
    const result = await Promise.all(
      response.body.hits.hits.map(async (hit) => {
        return {
          category: hit["_source"].category,
          title: hit["_source"].title,
          slug: hit["_source"].slug,
          question: hit["_source"].question,
          bookslug: hit["_source"]?.book?.slug,
        };
      })
    );
    return { data: result, totalSolutions: response.body.hits.total.value };
  } catch (error) {
    return error;
  }
};

exports.RelatedSearch = async (indexName, question, category) => {
  try {
    const questionRelated = await esClient.search({
      index: indexName,
      size: 7,
      body: {
        query: {
          multi_match: {
            query: question,
            fields: ["question", "title"],
            type: "most_fields",
          },
        },
      },
    });
    if (questionRelated.body.hits.hits.length > 0) {
      const questiArray = questionRelated.body.hits.hits.map(
        (hit) => hit._source
      );
      return {
        data: questiArray.splice(1, 6),
        totalSolutions: questionRelated.body.hits.total.value,
      };
    }
    const categoryRelated = await esClient.search({
      index: indexName,
      size: 7,
      body: {
        query: {
          multi_match: {
            query: category,
            fields: ["category.name"],
            type: "most_fields",
          },
        },
      },
    });
    const categoryArray = categoryRelated.body.hits.hits.map(
      (hit) => hit._source
    );
    return {
      data: categoryArray,
      totalSolutions: categoryArray.body.hits.total.value,
    };
  } catch (error) {
    return error;
  }
};

// exports.bulkIndex = async (indexName, bulkData) => {
//   const body = flatMap(bulkData, doc => [{ index: { _index: indexName } }, doc]);
//   // return body;

//   const { response } = await Client.bulk({ body, refresh: true });
//   console.log(response);
// }

// exports.countIndexes = async (indexName) => {
//   const { body } = Client.count({
//     index: indexName,
//   })

//   console.log('successfully counted the indexes: ', body);
//   return body;
// }
