import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { IngredientDTO, RecipeDTO, RelationDTO } from '../../../../shared/recipe.types'
import type { TranslationKeys } from '../../../internationalization/types'

// Create styles
const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    marginRight: 10,
  },
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  recipe: {
    marginBottom: 30,
    pageBreakInside: false,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeInfo: {
    fontSize: 12,
    marginBottom: 15,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000000',
    backgroundColor: '#f0f0f0',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #cccccc',
    padding: 6,
  },
  col1: { width: '40%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  cellText: {
    fontSize: 10,
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 10,
    color: '#666666',
    fontStyle: 'italic',
    padding: 6,
  },
})

interface RecipesPDFDocumentProps {
  recipes: (RecipeDTO & {
    usedInRecipesCount: number
    ingredients: (IngredientDTO & { relation: RelationDTO })[]
    subRecipes: (RecipeDTO & { relation: RelationDTO })[]
    base64Data: string
  })[]
  t: (key: TranslationKeys) => string
  includeImages?: boolean
}

const RecipesPDFDocument = ({ recipes, t, includeImages = false }: RecipesPDFDocumentProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{t('recipes')}</Text>

        {recipes.map((recipe) => (
          <View key={recipe.id} style={styles.recipe}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>

            <Text style={styles.recipeInfo}>
              {t('produces')}: {recipe.produces} {recipe.units} | {t('status')}: {recipe.status} |{t('usedIn')}{' '}
              {recipe.usedInRecipesCount} {recipe.usedInRecipesCount === 1 ? t('recipe') : t('recipes')}
            </Text>

            {includeImages && recipe.base64Data && (
              <View style={styles.image}>
                <Image src={recipe.base64Data} />
              </View>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>{t('ingredients')}:</Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, styles.col1]}>{t('title')}</Text>
                  <Text style={[styles.headerText, styles.col2]}>{t('quantity')}</Text>
                  <Text style={[styles.headerText, styles.col3]}>{t('units')}</Text>
                  <Text style={[styles.headerText, styles.col4]}>{t('unitCost')}</Text>
                  <Text style={[styles.headerText, styles.col5]}>{t('totalCost')}</Text>
                </View>

                {recipe.ingredients.map((ingredient, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.cellText, styles.col1]}>{ingredient.title}</Text>
                    <Text style={[styles.cellText, styles.col2]}>{ingredient.relation.quantity}</Text>
                    <Text style={[styles.cellText, styles.col3]}>{ingredient.relation.units}</Text>
                    <Text style={[styles.cellText, styles.col4]}>${ingredient.unitCost.toFixed(2)}</Text>
                    <Text style={[styles.cellText, styles.col5]}>
                      ${(ingredient.relation.quantity * ingredient.unitCost).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>{t('ingredients')}:</Text>
                <Text style={styles.noData}>{t('noDataAvailable')}</Text>
              </View>
            )}

            {recipe.subRecipes && recipe.subRecipes.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>{t('recipes')}:</Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, styles.col1]}>{t('title')}</Text>
                  <Text style={[styles.headerText, styles.col2]}>{t('quantity')}</Text>
                  <Text style={[styles.headerText, styles.col3]}>{t('units')}</Text>
                  <Text style={[styles.headerText, styles.col4]}>{t('produces')}</Text>
                  <Text style={[styles.headerText, styles.col5]}>{t('status')}</Text>
                </View>

                {recipe.subRecipes.map((subRecipe, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.cellText, styles.col1]}>{subRecipe.title}</Text>
                    <Text style={[styles.cellText, styles.col2]}>{subRecipe.relation.quantity}</Text>
                    <Text style={[styles.cellText, styles.col3]}>{subRecipe.relation.units}</Text>
                    <Text style={[styles.cellText, styles.col4]}>
                      {subRecipe.produces} {subRecipe.units}
                    </Text>
                    <Text style={[styles.cellText, styles.col5]}>{subRecipe.status}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default RecipesPDFDocument
