package curius

type Trail struct {
	id int64 `json:"id"`
	trailName string `json:"trailName"`
}

type Highlight struct {
	id int64 `json:"id"`
	highlight string `json:"highlight"`
}

type Metadata struct {
	full_text string `json:"full_text"`
	page_type string `json:"page_type"`
}

type CuriusSave struct {
	id int64 `json:"id"`
	link string `json:"link"`
	title string `json:"title"`
	highlights []Highlight `json:"highlights"`
	trails []Trail `json:"trails"`
	metadata Metadata `json:"metadata"`
}

type CuriusBlob struct { 
	userSaved []CuriusSave `json:"userSaved"`	
}