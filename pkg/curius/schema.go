package curius

type Trail struct {
	Id int64 `json:"id"`
	TrailName string `json:"trailName"`
}

type Highlight struct {
	Id int64 `json:"id"`
	Highlight string `json:"highlight"`
}

type Metadata struct {
	Full_text string `json:"full_text"`
	Page_type string `json:"page_type"`
}

type CuriusSave struct {
	Id int64 `json:"id"`
	Link string `json:"link"`
	CreatedDate string `json:"createdDate"`
	Title string `json:"title"`
	Highlights []Highlight `json:"highlights"`
	Trails []Trail `json:"trails"`
	Metadata Metadata `json:"metadata"`
}

type CuriusBlob struct { 
	UserSaved []CuriusSave `json:"userSaved"`	
}