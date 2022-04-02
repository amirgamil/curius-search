package curius

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
)


func GetAllCuriusSaves() ([]CuriusSave, error) {
	var curiusBlob CuriusBlob
	var allCuriusSaves []CuriusSave
	continueSearching := true 
	for page := 0; !continueSearching; page++  {
		curiusId := os.Getenv("CURIUS_USER_ID")
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
		if len(curiusBlob.userSaved) == 0 {
			continueSearching = false;
		} else {
			allCuriusSaves = append(allCuriusSaves, curiusBlob.userSaved...)
		}
	}
	return allCuriusSaves, nil
}