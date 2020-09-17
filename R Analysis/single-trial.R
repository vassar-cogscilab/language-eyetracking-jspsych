library(jsonlite)
library(dplyr)
library(ggplot2)
library(gganimate)
library(grid)

data <- fromJSON('sample_data/one-trial.txt')
eye.data <- fromJSON(data$gaze_data)

image.bg <- png::readPNG('sample_data/Mail10d1BMP_result.png')

ggplot(eye.data, aes(x=x, y=y))+
  annotation_custom(rasterGrob(image.bg, width = unit(1, "npc"), height = unit(1, "npc")),
                    0, 720, 0, -576)+
  scale_y_reverse()+
  geom_point()+
  coord_cartesian(xlim=c(0,720), ylim=c(0,576))+
  transition_time(t)+
  theme_minimal()+
  theme(panel.grid = element_blank())

anim_save("test.gif")

eye.data %>% mutate(diff = t - lag(t))
