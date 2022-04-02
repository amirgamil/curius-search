package curius

import (
	"fmt"
	"log"
	"os"

	jsoniter "github.com/json-iterator/go"
)

//exports curius data to do some data visualization with it
func SaveCuriusArticles() {
	curiusSaves, err := GetAllCuriusSaves()
	if err != nil {
		log.Fatal(err)
	}
	writeRecordListToDisk(path, curiusSaves)
	
}

const path = "./data/curius.json"

func writeRecordListToDisk(path string, list []CuriusSave) {
	createFile(path)
	//flags we pass here are important, need to replace the entire file
	jsonFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		fmt.Println("Error trying to write the new inverted index to disk")
	}
	defer jsonFile.Close()
	jsoniter.NewEncoder(jsonFile).Encode(list)
}

func createFile(path string) {
	f, errCreating := os.Create(path)
	if errCreating != nil {
		log.Fatal("Error, could not create database for path: ", path, " with: ", errCreating)
		return
	}
	f.Close()
}
