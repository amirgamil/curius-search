package sources

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/amirgamil/curius-search/pkg/apollo-curius/schema"
	"github.com/amirgamil/curius-search/pkg/curius"
)

const curiusPath = "../curius/data.json"


func getCurius() map[string]schema.Data {
	// data, err := curius.GetAllCuriusSaves()
	// if err != nil {
	// 	log.Println(err)
	// 	return make(map[string]schema.Data)
	// }
	fmt.Println("Hello")
	dataToIndex := convertToReqFormat([]curius.CuriusSave{})
	return dataToIndex
}

func loadCuriusData() ([]curius.CuriusSave, error) {
	var data []curius.CuriusSave
	file, err := os.Open(curiusPath)
	if err != nil {
		return []curius.CuriusSave{}, errors.New("Error loading data from Curius!")
	}
	json.NewDecoder(file).Decode(&data)
	return data, nil
}

func getTagsFromCuriusTrails(trails []curius.Trail) []string {
	var tags []string
	for _, trail := range trails {
		tags = append(tags, trail.trailName)
	}
	return tags
}

//takes a lists of thoughts and converts it into the require data struct we need for the api
func convertToReqFormat(data []curius.CuriusSave) map[string]schema.Data {
	dataToIndex := make(map[string]schema.Data)
	for i, curiusSave := range data {
		//check if we've computed the data for this already
		if _, isInMap := sources[strconv.Itoa(id)]; !isInMap {
			//trust curius to have all of the contents
			if (curiusSave.metadata.full_text != "") {
				dataToIndex[keyInMap] = schema.Data{Title: curiusSave.title, Content: curiusSave.metadata.full_text, Link: curiusSave.link, Tags: getTagsFromCuriusTrails(curiusSave.trails)}
			} else {
				//attempt to scrape it with go-query
				articleContents, err := schema.Scrape(curiusSave.link);
				if err != nil {
					log.Println(err)
				} else {
					dataToIndex[keyInMap] = schema.Data{Title: curiusSave.title, Content: articleContents.Content, Link: curiusSave.link, Tags: getTagsFromCuriusTrails(curiusSave.trails)}
				}

			}
		}
	}
	return dataToIndex
}
