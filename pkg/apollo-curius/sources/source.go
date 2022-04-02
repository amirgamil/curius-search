package sources

import (
	"github.com/amirgamil/curius-search/pkg/apollo-curius/schema"
)

var sources map[string]schema.Record

//TODO: make sourcesMap a global so we don't keep passing large maps in parameters
//TODO: should return map[string]schema.Data so we have control over the IDs
func GetData(sourcesMap map[string]schema.Record) map[string]schema.Data {
	sources = sourcesMap
	return getCurius();
}
