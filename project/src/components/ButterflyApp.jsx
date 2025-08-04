import { useState, useEffect } from 'react'
import { Button, Card, Input, Modal, Form, Select, message, Badge, Tabs, Progress } from 'antd'
import { PlusOutlined, EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { Butterfly } from '../entities/Butterfly'

const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

function ButterflyApp() {
  const [butterflies, setButterflies] = useState([])
  const [filteredButterflies, setFilteredButterflies] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedButterfly, setSelectedButterfly] = useState(null)
  const [form] = Form.useForm()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('all')
  const [activeTab, setActiveTab] = useState('gallery')

  const commonButterflies = [
    {
      species: 'Danaus plexippus',
      commonName: 'Monarch',
      wingspan: '8.9-10.2 cm',
      habitat: 'Open fields, meadows, gardens',
      color: 'Orange with black borders',
      region: 'North America',
      isSpotted: false
    },
    {
      species: 'Papilio machaon',
      commonName: 'Old World Swallowtail',
      wingspan: '6.5-8.6 cm',
      habitat: 'Gardens, meadows, hills',
      color: 'Yellow with black markings',
      region: 'Europe, Asia, North America',
      isSpotted: false
    },
    {
      species: 'Vanessa atalanta',
      commonName: 'Red Admiral',
      wingspan: '4.5-6.0 cm',
      habitat: 'Gardens, parks, woodland edges',
      color: 'Black with red bands and white spots',
      region: 'Worldwide',
      isSpotted: false
    },
    {
      species: 'Pieris rapae',
      commonName: 'Small White',
      wingspan: '3.2-4.7 cm',
      habitat: 'Gardens, cultivated areas',
      color: 'White with black spots',
      region: 'Europe, Asia, North America',
      isSpotted: false
    },
    {
      species: 'Aglais io',
      commonName: 'European Peacock',
      wingspan: '5.0-6.2 cm',
      habitat: 'Gardens, parks, woodland',
      color: 'Reddish-brown with large eyespots',
      region: 'Europe, Asia',
      isSpotted: false
    },
    {
      species: 'Limenitis arthemis',
      commonName: 'Red-spotted Purple',
      wingspan: '7.0-8.9 cm',
      habitat: 'Deciduous forests, gardens',
      color: 'Blue-black with red spots',
      region: 'North America',
      isSpotted: false
    }
  ]

  const loadButterflies = async () => {
    try {
      const result = await Butterfly.list()
      if (result.success) {
        setButterflies(result.data)
        setFilteredButterflies(result.data)
      }
    } catch (error) {
      console.error('Failed to load butterflies:', error)
    }
  }

  const initializeWithCommonButterflies = async () => {
    try {
      const existingResult = await Butterfly.list()
      if (existingResult.success && existingResult.data.length === 0) {
        for (const butterfly of commonButterflies) {
          await Butterfly.create(butterfly)
        }
        loadButterflies()
        message.success('Butterfly collection initialized!')
      }
    } catch (error) {
      console.error('Failed to initialize butterflies:', error)
    }
  }

  const handleSpotButterfly = async (butterflyId) => {
    try {
      const result = await Butterfly.update(butterflyId, {
        isSpotted: true,
        spottedDate: new Date().toISOString().split('T')[0]
      })
      if (result.success) {
        message.success('Butterfly spotted! Added to your collection.')
        loadButterflies()
      }
    } catch (error) {
      message.error('Failed to update butterfly')
    }
  }

  const handleAddCustomButterfly = async (values) => {
    try {
      const result = await Butterfly.create({
        ...values,
        isSpotted: values.isSpotted || false,
        spottedDate: values.isSpotted ? new Date().toISOString().split('T')[0] : null
      })
      if (result.success) {
        message.success('Custom butterfly added!')
        loadButterflies()
        setIsModalVisible(false)
        form.resetFields()
      }
    } catch (error) {
      message.error('Failed to add butterfly')
    }
  }

  const filterButterflies = () => {
    let filtered = butterflies.filter(butterfly =>
      butterfly.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      butterfly.species.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterRegion !== 'all') {
      filtered = filtered.filter(butterfly =>
        butterfly.region.toLowerCase().includes(filterRegion.toLowerCase())
      )
    }

    setFilteredButterflies(filtered)
  }

  useEffect(() => {
    loadButterflies()
    initializeWithCommonButterflies()
  }, [])

  useEffect(() => {
    filterButterflies()
  }, [searchTerm, filterRegion, butterflies])

  const spottedCount = butterflies.filter(b => b.isSpotted).length
  const totalCount = butterflies.length
  const completionPercentage = totalCount > 0 ? Math.round((spottedCount / totalCount) * 100) : 0

  const regions = ['all', 'North America', 'Europe', 'Asia', 'Worldwide']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🦋 Butterfly Explorer
          </h1>
          <p className="text-gray-600 text-lg">Discover, identify, and collect beautiful butterflies</p>
        </div>

        <div className="mb-6">
          <Card className="shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <Search
                  placeholder="Search butterflies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:max-w-xs"
                  prefix={<SearchOutlined />}
                />
                <Select
                  value={filterRegion}
                  onChange={setFilterRegion}
                  className="md:w-48"
                  prefix={<FilterOutlined />}
                >
                  {regions.map(region => (
                    <Option key={region} value={region}>
                      {region === 'all' ? 'All Regions' : region}
                    </Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 border-0"
              >
                Add Custom Butterfly
              </Button>
            </div>
          </Card>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
          <TabPane tab="Butterfly Gallery" key="gallery">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredButterflies.map((butterfly) => (
                <Card
                  key={butterfly._id}
                  className={`shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    butterfly.isSpotted ? 'ring-2 ring-green-400' : ''
                  }`}
                  cover={
                    <div className="h-48 bg-gradient-to-br from-yellow-100 to-purple-100 flex items-center justify-center text-6xl">
                      🦋
                    </div>
                  }
                  actions={[
                    !butterfly.isSpotted ? (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleSpotButterfly(butterfly._id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Spot it!
                      </Button>
                    ) : (
                      <Badge status="success" text="Spotted!" />
                    )
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="flex justify-between items-start">
                        <span className="text-lg font-semibold">{butterfly.commonName}</span>
                        {butterfly.isSpotted && <Badge count="✓" style={{ backgroundColor: '#52c41a' }} />}
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <p className="text-sm italic text-gray-600">{butterfly.species}</p>
                        <p className="text-sm"><strong>Wingspan:</strong> {butterfly.wingspan}</p>
                        <p className="text-sm"><strong>Region:</strong> {butterfly.region}</p>
                        <p className="text-sm"><strong>Colors:</strong> {butterfly.color}</p>
                        {butterfly.isSpotted && butterfly.spottedDate && (
                          <p className="text-xs text-green-600">
                            <strong>Spotted:</strong> {butterfly.spottedDate}
                          </p>
                        )}
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </TabPane>

          <TabPane tab="My Collection" key="collection">
            <Card className="shadow-lg mb-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Collection Progress</h3>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-lg">
                    <strong>{spottedCount}</strong> of <strong>{totalCount}</strong> butterflies spotted
                  </span>
                </div>
                <Progress
                  percent={completionPercentage}
                  strokeColor={{
                    '0%': '#9333ea',
                    '100%': '#ec4899',
                  }}
                  className="max-w-md mx-auto"
                />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {butterflies
                .filter(butterfly => butterfly.isSpotted)
                .map((butterfly) => (
                  <Card
                    key={butterfly._id}
                    className="shadow-lg ring-2 ring-green-400"
                    cover={
                      <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center text-6xl">
                        🦋
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <div className="flex justify-between items-start">
                          <span className="text-lg font-semibold">{butterfly.commonName}</span>
                          <Badge count="✓" style={{ backgroundColor: '#52c41a' }} />
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <p className="text-sm italic text-gray-600">{butterfly.species}</p>
                          <p className="text-sm text-green-600">
                            <strong>Spotted:</strong> {butterfly.spottedDate}
                          </p>
                          {butterfly.notes && (
                            <p className="text-sm">
                              <strong>Notes:</strong> {butterfly.notes}
                            </p>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
            </div>

            {spottedCount === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🦋</div>
                <h3 className="text-xl text-gray-600 mb-2">No butterflies spotted yet!</h3>
                <p className="text-gray-500">Go to the gallery and start spotting butterflies to build your collection.</p>
              </div>
            )}
          </TabPane>
        </Tabs>

        <Modal
          title="Add Custom Butterfly"
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddCustomButterfly}
          >
            <Form.Item
              name="commonName"
              label="Common Name"
              rules={[{ required: true, message: 'Please enter the common name' }]}
            >
              <Input placeholder="e.g., Monarch" />
            </Form.Item>

            <Form.Item
              name="species"
              label="Scientific Name"
              rules={[{ required: true, message: 'Please enter the scientific name' }]}
            >
              <Input placeholder="e.g., Danaus plexippus" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="wingspan"
                label="Wingspan"
              >
                <Input placeholder="e.g., 8.9-10.2 cm" />
              </Form.Item>

              <Form.Item
                name="region"
                label="Region"
              >
                <Input placeholder="e.g., North America" />
              </Form.Item>
            </div>

            <Form.Item
              name="color"
              label="Colors"
            >
              <Input placeholder="e.g., Orange with black borders" />
            </Form.Item>

            <Form.Item
              name="habitat"
              label="Habitat"
            >
              <Input placeholder="e.g., Open fields, meadows, gardens" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={3} placeholder="Any additional notes..." />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                  Add Butterfly
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default ButterflyApp