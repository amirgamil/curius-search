package curius

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func loadEnv() string {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	return os.Getenv("CURIUS_USER_ID")
}

func GetAllCuriusSaves() ([]CuriusSave, error) {
	var curiusBlob CuriusBlob
	var allCuriusSaves []CuriusSave
	continueSearching := true 
	curiusId := loadEnv()
	for page := 0; continueSearching ; page++  {
		log.Println(fmt.Sprintf("Getting page %d", page))
		url := "https://curius.app/api/users/" + curiusId + "/links?page=" + strconv.Itoa(page)
		resp, err := http.Get(url)
		if err != nil {
			return []CuriusSave{}, errors.New(fmt.Sprintf("Error scraping the Curius saved links: ", err))
		}
		defer resp.Body.Close()
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return []CuriusSave{}, errors.New(fmt.Sprintf("Error reading scraped Curius link: ", err))
		}
		err = json.Unmarshal(body, &curiusBlob)
		if err != nil {
			return []CuriusSave{}, errors.New(fmt.Sprintf("Error unmarshaling scraped Curius link: ", err))
		}
		if len(curiusBlob.UserSaved) == 0 {
			continueSearching = false;
		} else {
			allCuriusSaves = append(allCuriusSaves, curiusBlob.UserSaved...)
		}
	}
	return allCuriusSaves, nil
}